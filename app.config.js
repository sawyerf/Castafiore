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
					],
					NSBonjourServices: [
						"_upnp._tcp",
						"_services._dns-sd._udp"
					],
					NSLocalNetworkUsageDescription: "Castafiore needs access to your local network to discover and stream music to UPNP/DLNA devices like speakers and TVs."
				},
				bundleIdentifier: "com.sawyerf.castafiore"
			},
			android: {
				package: "com.sawyerf.castafiore",
				edgeToEdgeEnabled: true,
				permissions: [
					"INTERNET",
					"ACCESS_WIFI_STATE",
					"CHANGE_WIFI_MULTICAST_STATE",
					"ACCESS_NETWORK_STATE"
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
					projectId: "c61aa6bb-acc5-4fed-bf01-a974a2770155"
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
				]
			]
		}
	}
}
