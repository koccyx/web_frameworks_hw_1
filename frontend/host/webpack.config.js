const path = require("path");
const webpack = require("webpack");
const { createBaseConfig } = require("../webpack.shared");

module.exports = (_, argv) => {
  const mode = argv.mode || "development";
  const isProd = mode === "production";
  const config = createBaseConfig({
    name: "host",
    port: 5173,
    mode,
    entry: path.resolve(__dirname, "src/index.tsx"),
    outputPath: path.resolve(__dirname, "dist"),
    remotes: {
      mfCatalog: isProd ? "mfCatalog@/mf-catalog/remoteEntry.js" : "mfCatalog@http://localhost:5174/remoteEntry.js",
      mfMatching: isProd ? "mfMatching@/mf-matching/remoteEntry.js" : "mfMatching@http://localhost:5175/remoteEntry.js",
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
