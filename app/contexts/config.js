import AsyncStorage from '@react-native-async-storage/async-storage'
import { initCacheSong } from '~/utils/cache'
import React from 'react'

const getConfig = async () => {
	const config = await AsyncStorage.getItem('config')
	if (config === null) return { url: null, username: null, query: null }
	return JSON.parse(config)
}

const ConfigContext = React.createContext()
const SetConfigContext = React.createContext()

export const useConfig = () => React.useContext(ConfigContext)
export const useSetConfig = () => React.useContext(SetConfigContext)

export const ConfigProvider = ({ children }) => {
	const [config, setConfig] = React.useState({})

	React.useEffect(() => {
		if (config.url) return
		getConfig().then((data) => setConfig(data))
	}, [])

	React.useEffect(() => {
		if (!config.url) return
		const folderCache = config.url.replace(/[^a-zA-Z0-9]/g, '_')
		global.config = { ...config, folderCache }
		initCacheSong()
		global.songsDownloading = []
	}, [config])

	return (
		<ConfigContext.Provider value={config}>
			<SetConfigContext.Provider value={setConfig}>
				{children}
			</SetConfigContext.Provider>
		</ConfigContext.Provider>
	)
}