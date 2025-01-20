const createExpoWebpackConfigAsync = require("@expo/webpack-config");
const path = require("path");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

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

		config.plugins.push(
			new CopyWebpackPlugin({
				patterns: [
					{
						from: path.resolve(__dirname, "assets/icon.svg"),
						to: path.resolve(__dirname, "web-build/pwa/icon.svg"),
					},
					{
						from: path.resolve(__dirname, "assets/adaptative-icon.png"),
						to: path.resolve(__dirname, "web-build/pwa/adaptative-icon.png"),
					},
				],
			}),
		)

		// Uncomment to analyze bundle size
		// config.plugins.push(
		// 	new BundleAnalyzerPlugin({
		// 		path: 'web-report',
		// 	})
		// );
	}

	return config;
};