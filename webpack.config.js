const createExpoWebpackConfigAsync = require("@expo/webpack-config");
const path = require("path");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");

module.exports = async function (env, argv) {
  // Set by expo-cli during `expo build:web`
  const isEnvProduction = env.mode === "production";

  // Create the default config
  const config = await createExpoWebpackConfigAsync(env, argv);

  if (isEnvProduction) {
    config.plugins.push(
      new WorkboxWebpackPlugin.InjectManifest({
        swSrc: path.resolve(__dirname, "app/services/serviceWorker.js"),
        dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
        exclude: [
          /\.map$/,
          /asset-manifest\.json$/,
          /LICENSE/,
          /\.js\.gz$/,
          /(apple-touch-startup-image|chrome-icon|apple-touch-icon).*\.png$/,
        ],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      })
    );
  }

  return config;
};