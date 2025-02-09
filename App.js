import React from 'react';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TabBar from '~/components/bar/TabBar';
import { HomeStack, SearchStack, PlaylistsStack, SettingsStack } from '~/screens/Stacks';

import { ConfigContext, SetConfigContext, getConfig } from '~/contexts/config';
import { getSettings, SettingsContext, SetSettingsContext } from '~/contexts/settings';
import Player from '~/utils/player';
import { SongContext, SongDispatchContext, defaultSong, songReducer } from '~/contexts/song';
import { ThemeContext, getTheme } from '~/contexts/theme';

const Tab = createBottomTabNavigator();

const App = () => {
	const [config, setConfig] = React.useState({});
	const [settings, setSettings] = React.useState({});
	const [song, dispatch] = React.useReducer(songReducer, defaultSong)
	const [theme, setTheme] = React.useState(getTheme())
	Player.useEvent(dispatch)

	React.useEffect(() => {
		if (!song.isInit) Player.initPlayer(dispatch)
		getConfig()
			.then((config) => {
				setConfig(config)
			})
		getSettings()
			.then((settings) => {
				setSettings(settings)
			})
	}, [])

	React.useEffect(() => {
		if (window) window.config = config
	}, [config])

	React.useEffect(() => {
		setTheme(getTheme(settings))
	}, [settings.theme])

	React.useEffect(() => {
		if (window) window.streamFormat = settings.streamFormat
	}, [settings.streamFormat])

	React.useEffect(() => {
		if (window) window.maxBitRate = settings.maxBitRate
	}, [settings.maxBitRate])

	const saveSettings = React.useCallback((settings) => {
		setSettings(settings)
		AsyncStorage.setItem('settings', JSON.stringify(settings))
			.catch((error) => {
				console.error('Save settings error:', error)
			})
	}, [settings, setSettings])

	return (
		<SetConfigContext.Provider value={setConfig}>
			<SetSettingsContext.Provider value={saveSettings}>
				<SongDispatchContext.Provider value={dispatch}>
					<ConfigContext.Provider value={config}>
						<SettingsContext.Provider value={settings}>
							<ThemeContext.Provider value={theme}>
								<SongContext.Provider value={song}>
									<SafeAreaProvider>
										<NavigationContainer
											documentTitle={{
												formatter: () => {
													return `Castafiore`
												}
											}}
										>
											<StatusBar
												backgroundColor={'rgba(0, 0, 0, 0)'}
												translucent={true}
												barStyle={'light-content'}
											/>
											<Tab.Navigator
												tabBar={(props) => <TabBar {...props} />}
												screenOptions={{
													headerShown: false,
													tabBarPosition: settings.isDesktop ? 'left' : 'bottom',
													tabBarStyle: {
														backgroundColor: theme.secondaryBack,
														borderTopColor: theme.secondaryBack,
														tabBarActiveTintColor: theme.primaryTouch,
													}
												}}
											>
												<Tab.Screen name="HomeStack" options={{ title: 'Home', icon: "home" }} component={HomeStack} />
												<Tab.Screen name="SearchStack" options={{ title: 'Search', icon: "search" }} component={SearchStack} />
												<Tab.Screen name="PlaylistsStack" options={{ title: 'Playlists', icon: "book" }} component={PlaylistsStack} />
												<Tab.Screen name="SettingsStack" options={{ title: 'Settings', icon: "gear" }} component={SettingsStack} />
											</Tab.Navigator>
										</NavigationContainer>
									</SafeAreaProvider>
								</SongContext.Provider>
							</ThemeContext.Provider>
						</SettingsContext.Provider>
					</ConfigContext.Provider>
				</SongDispatchContext.Provider>
			</SetSettingsContext.Provider>
		</SetConfigContext.Provider>
	);
}

export default App;