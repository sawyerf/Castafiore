const path = require("path");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => {
  const isEnvProduction = argv.mode === "production";

  return {
    entry: "./index.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
      chunkFilename: "static/js/[name].chunk.js",
    },
    resolve: {
      alias: {
        "react-native$": "react-native-web", // Redirige les imports React Native vers React Native Web
      },
      extensions: [".web.js", ".js", ".jsx", ".json"], // Ajout d'extensions pour React Native Web
    },
    optimization: {
      minimize: true,
      splitChunks: {
        chunks: 'all', // Choisir toutes les dépendances à diviser
      },
      minimizer: [new TerserPlugin({
        test: /\.js(\?.*)?$/i,
        parallel: true,
      })],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
        {
          test: /\.(png|jpe?g|gif|svg|ttf|woff|woff2|eot)$/,
          use: {
            loader: "file-loader",
            options: {
              name: "[path][name].[ext]",
            },
          },
        },
        {
          test: /\.(js|jsx)$/, // Match JS et JSX
          exclude: /node_modules\/(?!(react-native-vector-icons)\/).*/, // Inclure react-native-vector-icons
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
              plugins: [
                "@babel/plugin-transform-react-jsx", // Transformer JSX en JS
                "@babel/plugin-proposal-class-properties",
              ],
            },
          },
        },
        {
          test: /\.(png|jpe?g|gif|svg|ttf|woff|woff2|eot)$/, // Fichiers média
          use: {
            loader: "file-loader",
            options: {
              name: "[path][name].[ext]",
            },
          },
        },
      ],
    },
    plugins: isEnvProduction
      ? [
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
        }),
        new BundleAnalyzerPlugin()
      ]
      : [],
    devServer: {
      static: {
        directory: path.resolve(__dirname, "web"),
      },
      compress: true,
      port: 9000,
      open: true, // Ouvre le navigateur automatiquement
    },
  };
};
