import React from 'react'
import { View, Text, TextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { SettingsContext, SetSettingsContext } from '~/contexts/settings'
import presStyles from '~/styles/pres'
import mainStyles from '~/styles/main'
import settingsStyle from '~/styles/settings'
import theme from '~/utils/theme'
import Header from '~/components/Header'
import OptionInput from '~/components/Settings/OptionInput'

const CacheSettings = () => {
	const insets = useSafeAreaInsets()
	const settings = React.useContext(SettingsContext)
	const setSettings = React.useContext(SetSettingsContext)
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
		<View style={{ ...mainStyles.mainContainer(insets), flexDirection: 'column', alignItems: 'center', width: '100%' }}>
			<Header title="Cache" />
			<View style={{...settingsStyle.contentMainContainer(insets), marginTop: 30}}>
				<Text style={settingsStyle.titleContainer}>Auto Cache</Text >
				<View style={{...settingsStyle.optionsContainer, marginBottom: 5}}>
					<OptionInput
						title="Cache next song"
						value={cacheNextSong}
						onChangeText={(text) => setCacheNextSong(text.replace(/[^0-9]/g, ''))}
						inputMode="numeric"
						isLast={true}
					/>
				</View>
				<Text style={{ color: theme.secondaryLight, fontSize: 13, marginStart: 5, width: '100%', textAlign: 'left' }}>{'Auto download upcoming songs (default: 5)'}</Text >
			</View>
		</View>
	)
}

export default CacheSettings;