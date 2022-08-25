const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { TRUE } = require("node-sass");
const { loadavg } = require("os");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;

const filename = (ext) =>
  isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;

const plugins = () => {
  const basePlugins = [
    new HTMLWebpackPlugin({
      filename: "index.html",
      template: path.resolve(__dirname, "./src/index.html"),
      minify: {
        collapseWhitespace: isProd,
      },
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: `./css/${filename("css")}`,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/assets"),
          to: path.resolve(__dirname, "app"),
        },
      ],
	 }),
	 
  ];

  if (isProd) {
    basePlugins.push(
    );
  }

  return basePlugins;
};

module.exports = {
  context: path.resolve(__dirname, "src"),
  mode: "development",
  entry: "./js/main.js",
  target: ["web", "es5"],
  output: {
    filename: `./js/${filename("js")}`,
    path: path.resolve(__dirname, "app"),
    publicPath: "",
  },
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, "app"),
    },
    open: true,
    hot: true,
    compress: true,
    port: 3000,
  },
  plugins: plugins(),
  devtool: isProd ? false : "source-map",
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: "html-loader",
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: (resourcePath, context) => {
                return path.relative(path.dirname(resourcePath), context) + "/";
              },
            },
          },
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        generator: {
          filename: "img/[name][ext][query]",
        },
        type: "asset/resource",
      },
      {
        test: /\.(woff2)$/i,
        generator: {
          filename: "fonts/[name][ext][query]",
        },
        type: "asset/resource",
      },
    ],
  },
};
