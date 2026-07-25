const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (_, argv = {}) => {
  const isDev = (argv.mode || "production") === "development";

  return {
    mode: isDev ? "development" : "production",
    devtool: isDev ? "cheap-module-source-map" : false,
    entry: {
      popup: path.resolve(__dirname, "src/options/popup.js"),
      "content-scripts/content": path.resolve(__dirname, "src/content-scripts/content.js"),
      "content-scripts/inject": path.resolve(__dirname, "src/content-scripts/inject.js"),
      "content-scripts/monitor-manager": path.resolve(__dirname, "src/content-scripts/monitor-manager.js"),
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "scripts/[name].js",
      clean: true,
      publicPath: "",
    },
    plugins: [
      new webpack.DefinePlugin({
        __FCABR_DEBUG__: JSON.stringify(isDev),
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "src/options/popup.html"),
        filename: "popup.html",
        chunks: ["popup"],
        scriptLoading: "defer",
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: "public", to: "." },
          { from: "manifest.json", to: "manifest.json" },
        ],
      }),
    ],
  };
};
