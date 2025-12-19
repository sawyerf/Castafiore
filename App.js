import React from 'react'
import { Platform } from 'react-native'
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context'

import '~/i18next/i18next'
import { version } from '~/../package.json'
import AppProvider from '~/contexts'
import logger from '~/utils/logger'
import Navigation from '~/components/Navigation'


global.maxBitRate = 0
global.streamFormat = 'mp3'

const App = () => {
	React.useEffect(() => {
		logger.info('App', `App started (version: ${version}, platform: ${Platform.OS} ${Platform.Version})`)
	}, [])

	return (
		<AppProvider>
			<SafeAreaProvider initialMetrics={initialWindowMetrics}>
				<Navigation />
			</SafeAreaProvider>
		</AppProvider>
	)
}

export default App