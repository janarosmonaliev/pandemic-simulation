const path = require("path");
// const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    app: "./src/index.js",
  },
  plugins: [
    // new CleanWebpackPlugin(['dist/*']) for < v2 versions of CleanWebpackPlugin
    // new CleanWebpackPlugin(["dist/*"]),
    new HtmlWebpackPlugin({
      title: "Production",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gltf)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
          outputPath: "./assets",


        }
      },
    ],
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
};
