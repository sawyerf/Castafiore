import React from 'react';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeStack, SearchStack, PlaylistsStack, SettingsStack } from '~/screens/Stacks';
import TabBar from '~/components/bar/TabBar';

import { ConfigContext, SetConfigContext, getConfig } from '~/contexts/config';
import { getListCacheSong } from '~/utils/cache';
import { getSettings, SettingsContext, SetSettingsContext } from '~/contexts/settings';
import { setNavigationBarColor } from '~/utils/navigationBar';
import { SetUpdateApiContext, UpdateApiContext } from '~/contexts/updateApi';
import { SongContext, SongDispatchContext, defaultSong, songReducer } from '~/contexts/song';
import { ThemeContext, getTheme } from '~/contexts/theme';
import Player from '~/utils/player';

const Tab = createBottomTabNavigator();

global.maxBitRate = 0;
global.streamFormat = 'mp3';

const App = () => {
	const [config, setConfig] = React.useState({});
	const [settings, setSettings] = React.useState({});
	const [song, dispatch] = React.useReducer(songReducer, defaultSong)
	const [theme, setTheme] = React.useState(getTheme())
	const [updateApi, setUpdateApi] = React.useState({ path: '', query: '' })
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
		getListCacheSong()
			.then((songs) => {
				if (window) window.listCacheSong = songs || []
				else global.listCacheSong = songs || []
			})
	}, [])

	React.useEffect(() => {
		if (window) window.config = config
	}, [config])

	React.useEffect(() => {
		setTheme(getTheme(settings))
	}, [settings.theme, settings.themePlayer])

	React.useEffect(() => {
		setNavigationBarColor(theme.secondaryBack)
	}, [theme])

	React.useEffect(() => {
		if (window) window.streamFormat = settings.streamFormat
		else global.streamFormat = settings.streamFormat
	}, [settings.streamFormat])

	React.useEffect(() => {
		if (window) window.maxBitRate = settings.maxBitRate
		else global.maxBitRate = settings.maxBitRate
	}, [settings.maxBitRate])

	React.useEffect(() => {
		if (window) window.cacheNextSong = settings.cacheNextSong
		else global.cacheNextSong = settings.cacheNextSong
	}, [settings.cacheNextSong])

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
				<SetUpdateApiContext.Provider value={setUpdateApi}>
					<SongDispatchContext.Provider value={dispatch}>
						<ConfigContext.Provider value={config}>
							<SettingsContext.Provider value={settings}>
								<ThemeContext.Provider value={theme}>
									<SongContext.Provider value={song}>
										<UpdateApiContext.Provider value={updateApi}>
											<SafeAreaProvider initialMetrics={initialWindowMetrics}>
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
														barStyle={theme.barStyle}
													/>
													<Tab.Navigator
														tabBar={(props) => <TabBar {...props} />}
														screenOptions={{
															headerShown: false,
															navigationBarColor: theme.primaryBack,
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
										</UpdateApiContext.Provider>
									</SongContext.Provider>
								</ThemeContext.Provider>
							</SettingsContext.Provider>
						</ConfigContext.Provider>
					</SongDispatchContext.Provider>
				</SetUpdateApiContext.Provider>
			</SetSettingsContext.Provider>
		</SetConfigContext.Provider>
	);
}

export default App;