import React from 'react'
import { View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { SettingsContext, SetSettingsContext } from '~/contexts/settings'
import mainStyles from '~/styles/main'
import settingStyles from '~/styles/settings'
import Header from '~/components/Header'
import OptionInput from '~/components/settings/OptionInput'
import { ThemeContext } from '~/contexts/theme'

const CacheSettings = () => {
	const insets = useSafeAreaInsets()
	const settings = React.useContext(SettingsContext)
	const setSettings = React.useContext(SetSettingsContext)
	const theme = React.useContext(ThemeContext)
	const [cacheNextSong, setCacheNextSong] = React.useState(settings.cacheNextSong.toString())

	React.useEffect(() => {
		setCacheNextSong(settings.cacheNextSong.toString())
	}, [settings.cacheNextSong])

	React.useEffect(() => {
		if (cacheNextSong === '') return
		const number = parseInt(cacheNextSong)
		setSettings({ ...settings, cacheNextSong: number })
	}, [cacheNextSong])

	return (
		<View style={{ ...mainStyles.mainContainer(insets, theme), flexDirection: 'column', alignItems: 'center', width: '100%' }}>
			<Header title="Cache" />
			<View style={{...settingStyles.contentMainContainer(insets), marginTop: 30}}>
				<Text style={settingStyles.titleContainer(theme)}>Auto Cache</Text >
				<View style={{...settingStyles.optionsContainer(theme), marginBottom: 5}}>
					<OptionInput
						title="Cache next song"
						value={cacheNextSong}
						onChangeText={(text) => setCacheNextSong(text.replace(/[^0-9]/g, ''))}
						inputMode="numeric"
						isLast={true}
					/>
				</View>
				<Text style={settingStyles.description(theme)}>{'Auto download upcoming songs (default: 5)'}</Text >
			</View>
		</View>
	)
}

export default CacheSettings;