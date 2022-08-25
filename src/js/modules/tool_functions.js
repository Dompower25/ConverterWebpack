
export { toByn, reCalcAll, createElement };

function toByn(currency, { rate, scale }) {
  return (currency * (rate * scale)).toFixed(2);
}

function fromByn(byn, { rate, scale }) {
  return (byn / (rate * scale)).toFixed(2);
}

function reCalcAll(byn, availableInputs, conversionMapBynVal) {
  availableInputs.forEach((input) => {
    const currencyName = input?.id;
    const currencyToByn = conversionMapBynVal[currencyName];
    input.value = fromByn(byn, currencyToByn);
  });
}

function createElement(tagName, options = {}) {
  const el = document.createElement(tagName);
  Object.entries(options).forEach(([optionName, optionValue]) => {
    el[optionName] = optionValue;
  });
  return el;
}
