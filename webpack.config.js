const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (_, argv = {}) => ({
  mode: argv.mode || "production",
  entry: {
    popup: path.resolve(__dirname, "src/options/popup.js"),
    "content-scripts/content": path.resolve(__dirname,"src/content-scripts/content.js",),
    "content-scripts/inject": path.resolve(__dirname,"src/content-scripts/inject.js",),
    "content-scripts/monitor-manager": path.resolve(__dirname,"src/content-scripts/monitor-manager.js",),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "scripts/[name].js",
    clean: true,
    publicPath: "",
  },
  plugins: [
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
});
