const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "development",
  entry: ["./src/index.js"],
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist",
    open: false,
    hot: true,
    // writeToDisk: true,
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
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gltf|bin|zip)$/i,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]",
          outputPath: "./assets",
        },
      },
    ],
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
};
