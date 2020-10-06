const path = require("path");
// const HtmlWebpackPlugin = require("html-webpack-plugin");
// const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist",
  },
  //   plugins: [
  //     new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
  //     new HtmlWebpackPlugin({
  //       title: "Development",
  //     }),
  //   ],
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
};
