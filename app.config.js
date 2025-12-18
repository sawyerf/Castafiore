module.exports = ({ config }) => {
	return {
		expo: {
			name: "Castafiore",
			slug: "Castafiore",
			description: "Castafiore is a music player that support Navidrome and Subsonic API.",
			version: config.version,
			orientation: "default",
			icon: "./assets/icon.png",
			userInterfaceStyle: "light",
			newArchEnabled: false, // Disable New Architecture because react-native-track-player does not support it yet
			assetBundlePatterns: [
				"**/*"
			],
			ios: {
				supportsTablet: true,
				infoPlist: {
					UIBackgroundModes: [
						"audio"
					]
				},
				bundleIdentifier: "com.sawyerf.castafiore"
			},
			android: {
				package: "com.sawyerf.castafiore",
				edgeToEdgeEnabled: true,
				permissions: [
					"CHANGE_WIFI_MULTICAST_STATE",
				],
				adaptiveIcon: {
					foregroundImage: "./assets/foreground-icon.png",
					backgroundColor: "#660000"
				},
				splash: {
					image: "./assets/foreground-icon.png",
					resizeMode: "contain",
					backgroundColor: "#660000"
				}
			},
			web: {
				favicon: "./assets/icon.png",
				shortName: "Castafiore",
				startUrl: "./index.html",
				backgroundColor: "#121212",
				theme_color: "#121212"
			},
			extra: {
				eas: {
					projectId: "98d27f72-714e-415c-99f9-30f3f78d68e2"
				}
			},
			experiments: {
				baseUrl: process.env.PLATFORM === "web" ? "./" : undefined
			},
			plugins: [
				[
					"expo-build-properties",
					{
						android: {
							usesCleartextTraffic: true
						}
					}
				],
				[
					"react-native-edge-to-edge",
					{
						"android": {
							"parentTheme": "Default",
							"enforceNavigationBarContrast": false
						}
					}
				],
				[
					'./plugins/asyncStorage.js'
				],
				[
					'react-native-google-cast'
				]
			]
		}
	}
}
