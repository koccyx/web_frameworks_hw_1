const path = require("path");
const webpack = require("webpack");
const { createBaseConfig } = require("../webpack.shared");

module.exports = (_, argv) => {
  const mode = argv.mode || "development";
  const config = createBaseConfig({
    name: "mfCatalog",
    port: 5174,
    mode,
    entry: path.resolve(__dirname, "src/index.ts"),
    outputPath: path.resolve(__dirname, "dist"),
    exposes: {
      "./App": path.resolve(__dirname, "src/CatalogApp.tsx"),
    },
  });
  config.plugins.push(
    new webpack.DefinePlugin({
      "process.env.USERS_API_URL": JSON.stringify(process.env.USERS_API_URL || "http://localhost:3001"),
      "process.env.CORE_API_URL": JSON.stringify(process.env.CORE_API_URL || "http://localhost:3002"),
    })
  );
  return config;
};
