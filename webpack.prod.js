/** @format */

const nodeExternals = require("webpack-node-externals");
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: "./index.js",
  target: "node",
  mode: "production",
  output: {
    filename: "main.bundle.js",
    path: path.resolve(__dirname, "build"),
  },
  optimization: {
    noEmitOnErrors: true,
    removeAvailableModules: true,
    removeEmptyChunks: true,
    mergeDuplicateChunks: false,
    flagIncludedChunks: true,
  },
  plugins: [new CleanWebpackPlugin()],
  performance: {
    hints: "error",
  },
  externals: [nodeExternals()],

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.(scss)$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.html$/,
        use: ["html-loader"],
      },
      {
        test: /\.(svg|png|jpg|gif)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[hash].[ext]",
            outputPath: "assets",
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ["*", ".js", ".jsx"],
  },
};
