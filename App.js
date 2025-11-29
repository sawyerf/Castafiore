import React from 'react'
import { Platform } from 'react-native'
import { SystemBars } from 'react-native-edge-to-edge'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NavigationContainer } from '@react-navigation/native'
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useTranslation } from 'react-i18next'

import { HomeStack, SearchStack, PlaylistsStack, SettingsStack } from '~/screens/Stacks'
import TabBar from '~/components/bar/TabBar'

import '~/i18next/i18next'
import { ConfigContext, SetConfigContext, getConfig } from '~/contexts/config'
import { getSettings, updateGlobalSettings, SettingsContext, SetSettingsContext } from '~/contexts/settings'
import { initCacheSong } from '~/utils/cache'
import { localeLang } from '~/i18next/utils'
import { SetUpdateApiContext, UpdateApiContext } from '~/contexts/updateApi'
import { SongContext, SongDispatchContext, defaultSong, songReducer } from '~/contexts/song'
import { ThemeContext, getTheme } from '~/contexts/theme'
import { UpnpProvider } from '~/contexts/upnp'
import { version } from '~/../package.json'
import logger from '~/utils/logger'
import Player from '~/utils/player'
import * as LocalPlayer from '~/utils/player'

const Tab = createBottomTabNavigator()

global.maxBitRate = 0
global.streamFormat = 'mp3'

const App = () => {
	const [config, setConfig] = React.useState({})
	const [settings, setSettings] = React.useState({})
	const [song, dispatch] = React.useReducer(songReducer, defaultSong)
	const [theme, setTheme] = React.useState(getTheme())
	const [updateApi, setUpdateApi] = React.useState({ path: '', query: '' })
	const { i18n } = useTranslation()
	Player.useEvent(song, dispatch)
	updateGlobalSettings(settings)

	React.useEffect(() => {
		logger.info('App', `App started (version: ${version}, platform: ${Platform.OS} ${Platform.Version})`)
		if (!song.isInit) Player.initPlayer(dispatch)
		getConfig()
			.then((config) => {
				setConfig(config)
			})
		getSettings()
			.then((settings) => {
				setSettings(settings)
			})
		global.songsDownloading = []
	}, [])

	React.useEffect(() => {
		if (!config.url) return
		const folderCache = config.url.replace(/[^a-zA-Z0-9]/g, '_')
		global.config = { ...config, folderCache }
		initCacheSong()
	}, [config])

	React.useEffect(() => {
		setTheme(getTheme(settings))
	}, [settings.theme, settings.themePlayer])

	React.useEffect(() => {
		if (Platform.OS === 'web') window.document.documentElement.style.backgroundColor = theme.primaryBack
	}, [theme])

	React.useEffect(() => {
		const sysLang = localeLang()

		logger.info('i18n', `System language: ${sysLang || 'Not found'}, App language: ${settings.language || 'Not set'}`)
		i18n.changeLanguage(settings.language || sysLang || 'en')
			.catch(err => logger.error('i18n', err))
	}, [settings.language])

	const saveSettings = React.useCallback((settings) => {
		setSettings(settings)
		AsyncStorage.setItem('settings', JSON.stringify(settings))
			.catch((error) => {
				logger.error('Save settings', error)
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
											<UpnpProvider Player={Player} LocalPlayer={LocalPlayer}>
												<SafeAreaProvider initialMetrics={initialWindowMetrics}>
												<NavigationContainer
													documentTitle={{
														formatter: () => {
															return `Castafiore`
														}
													}}
												>
													<SystemBars style={theme.barStyle} />
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
											</UpnpProvider>
										</UpdateApiContext.Provider>
									</SongContext.Provider>
								</ThemeContext.Provider>
							</SettingsContext.Provider>
						</ConfigContext.Provider>
					</SongDispatchContext.Provider>
				</SetUpdateApiContext.Provider>
			</SetSettingsContext.Provider>
		</SetConfigContext.Provider>
	)
}

export default App