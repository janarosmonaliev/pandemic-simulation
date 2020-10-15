const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist",
  },
  plugins: [
    // new CleanWebpackPlugin(),
    // new HtmlWebpackPlugin({
    //   filename: "index.html",
    //   inject: true,
    //   template: path.resolve(__dirname, "dist"),
    //   title: "Development",
    // }),
  ],
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
};
