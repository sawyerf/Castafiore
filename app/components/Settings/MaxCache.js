import React from 'react'
import { View, Text, TextInput } from 'react-native'

import { SettingsContext, SetSettingsContext } from '~/utils/settings'
import presStyles from '~/styles/pres'
import mainStyles from '~/styles/main'
import theme from '~/utils/theme'

const MaxCache = () => {
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
		<View style={{ flexDirection: 'column', alignItems: 'center', width: '100%' }}>
			<Text style={{ ...presStyles.title, fontSize: 20, marginBottom: 10 }}>Auto Cache</Text >
			<Text style={{ color: theme.secondaryLight, fontSize: 13, marginBottom: 20, width: '80%', textAlign: 'center' }}>Auto download upcoming songs</Text >
			<TextInput
				style={{ ...mainStyles.inputSetting, marginHorizontal: 0 }}
				value={cacheNextSong}
				onChangeText={(text) => setCacheNextSong(text.replace(/[^0-9]/g, ''))}
				keyboardType="numeric"
			/>
		</View>
	)
}

export default MaxCache;