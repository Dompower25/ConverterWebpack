import '../scss/main.scss';
import '../index.html';

/*
 * https://www.nbrb.by/apihelp/exrates
 * Работу с внешним апи я вынес в отдельную функцию,
 * чтобы можно было протестировать скрипт за пределами Беларуси.
 *
 * В случае если апи недоступна - возращается заранее сохраненый ответ эмулирующий работу апи
 */

import { oldCoursArr } from "./modules/old_Cours.js";
import { toByn, reCalcAll, createElement } from "./modules/tool_functions.js";

function timeOutError({ sec }) {
  return new Promise((res, rej) =>
    setTimeout(() => rej("Time is out"), sec * 1000)
  );
}
async function getRatesFromApi() {
  try {
    const url = "https://www.nbrb.by/api/exrates/rates?periodicity=0";
    // Следующая строка проверяет что запрос не длится дольше 3х секунд
    const response = await Promise.race([fetch(url), timeOutError( {sec: 3} )]);
    return await response.json();
  } catch (e) {
    console.warn("Error when fetching rates from api. Reason:", e);
    console.log("Activate fallback mock");
    document.querySelector("#message").innerHTML = [
      "Сайт НБРБ не досутпен для вашей страны.",
      "Будут использованны последние известные данные на 3 апреля 2022 года",
    ].join("\n");
    return oldCoursArr;
  }
}

/**
 * Для удобства я сгруппироввал элементы которые захватываются со страницы
 * в переменную.
 * К ним теперь можно обращаться через elements. а IDE уже дальше подскажет
 * какие есть элементы
 */

const elements = {
  buttonAdd: document.querySelector(".add-convertor__box"),
  inputAll: document.querySelector(".void__box"),
  inputCollection: document.querySelector(".convertor__box"),
  containerToAdd: document.querySelector("#inputs"),
};

/**
 * Эту функцию я сделал "самовызвающейся". По умному это называется
 * Immediately Invoked Function Expression (IIFE)
 * https://blog.mgechev.com/2012/08/29/self-invoking-functions-in-javascript-or-immediately-invoked-function-expression/
 */

(async function (elements) {
  try {
    const officialCurrencies = await getRatesFromApi();

    // Создаем словарь: валюта -> курс
    const conversionMapBynVal = {};
    officialCurrencies.forEach(
      ({ Cur_OfficialRate, Cur_Abbreviation, Cur_Scale }) => {
        conversionMapBynVal[Cur_Abbreviation] = {
          rate: Cur_OfficialRate,
          scale: Cur_Scale,
        };
      }
    );

    conversionMapBynVal.BYN = {
      rate: 1,
      scale: 1,
    };

    /**
     * Для каждой прришедщей из апи валюты
     * создаем блк с инпутом
     */

    const availableInputs = officialCurrencies.map((item) => {
      const divConvertorBox = createElement("div", {
        className: "convertor__box row",
      });
      const input = createElement("input", {
        type: "number",
        id: item.Cur_Abbreviation,
        className: "form-control",
        value: 0,
      });
      const divCurrency = createElement("div", {
        className: "currency row",
      });
      const createSpanCountryFlag = createElement("span", {
        className: "country-flag flag-usd",
      });
      const createSpanValName = createElement("span", {
        className: "val-name",
        innerText: item.Cur_Abbreviation,
      });

      elements.containerToAdd.appendChild(divConvertorBox);
      divConvertorBox.appendChild(input);
      divConvertorBox.appendChild(divCurrency);
      divCurrency.appendChild(createSpanCountryFlag);
      divCurrency.appendChild(createSpanValName);
      return input;
    });

    // Добавляем слушатель событий с добавленых инпутов
    elements.inputAll.addEventListener("input", (e) => {
      const targetInput = e.target;
      const currencyName = targetInput.id;
      const currencyValue = targetInput.value;
      const currencyInByn = toByn(
        currencyValue,
        conversionMapBynVal[currencyName]
      );
      const allInputsExceptCurrent = availableInputs.filter(
        (input) => input !== targetInput
      );
      reCalcAll(currencyInByn, allInputsExceptCurrent, conversionMapBynVal);
    });
  } catch (error) {
    console.log(error);
  }
})(elements);