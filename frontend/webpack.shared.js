const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

function createBaseConfig(options) {
  const {
    name,
    port,
    mode,
    entry,
    outputPath,
    remotes = {},
    exposes = {},
    shared = {},
    env = {},
  } = options;

  const { ModuleFederationPlugin } = require("webpack").container;

  return {
    mode,
    entry,
    output: {
      path: outputPath,
      publicPath: "auto",
      clean: true,
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    devServer: {
      port,
      historyApiFallback: true,
      hot: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
    plugins: [
      new ModuleFederationPlugin({
        name,
        filename: "remoteEntry.js",
        remotes,
        exposes,
        shared: {
          // These are consumed during initial render; make them sync-available.
          react: { singleton: true, eager: true },
          "react-dom": { singleton: true, eager: true },
          "react-redux": { singleton: true, eager: true },
          "@reduxjs/toolkit": { singleton: true, eager: true },
          ...shared,
        },
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "host/public/index.html"),
      }),
    ],
  };
}

module.exports = { createBaseConfig };
