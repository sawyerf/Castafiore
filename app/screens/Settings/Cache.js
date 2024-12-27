import React from 'react'
import { View, Text, FlatList, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { clearCache } from '~/utils/cache'
import { confirmAlert } from '~/utils/alert'
import { getStatCache } from '~/utils/cache'
import { SettingsContext, SetSettingsContext } from '~/contexts/settings'
import { ThemeContext } from '~/contexts/theme'
import ButtonMenu from '~/components/settings/ButtonMenu'
import ButtonSwitch from '~/components/settings/ButtonSwitch'
import Header from '~/components/Header'
import mainStyles from '~/styles/main'
import OptionInput from '~/components/settings/OptionInput'
import settingStyles from '~/styles/settings'
import TableItem from '~/components/settings/TableItem'

const CacheSettings = () => {
	const insets = useSafeAreaInsets()
	const settings = React.useContext(SettingsContext)
	const setSettings = React.useContext(SetSettingsContext)
	const theme = React.useContext(ThemeContext)
	const [cacheNextSong, setCacheNextSong] = React.useState(settings.cacheNextSong.toString())
	const [statCache, setStatCache] = React.useState([
		{ name: 'Loading...', count: '' },
	])

	const getStat = () => {
		getStatCache()
			.then((res) => {
				setStatCache(res)
			})
	}

	React.useEffect(() => {
		getStat()
	}, [])

	React.useEffect(() => {
		setCacheNextSong(settings.cacheNextSong.toString())
	}, [settings.cacheNextSong])

	React.useEffect(() => {
		if (cacheNextSong === '') return
		const number = parseInt(cacheNextSong)
		setSettings({ ...settings, cacheNextSong: number })
	}, [cacheNextSong])

	return (
		<ScrollView style={{ ...mainStyles.mainContainer(insets, theme) }}>
			<Header title="Cache" />
			<View style={{ ...settingStyles.contentMainContainer(insets), marginTop: 30 }}>
				<Text style={settingStyles.titleContainer(theme)}>Auto Cache</Text >
				<View style={{ ...settingStyles.optionsContainer(theme), marginBottom: 5 }}>
					<OptionInput
						title="Cache next song"
						value={cacheNextSong}
						onChangeText={(text) => setCacheNextSong(text.replace(/[^0-9]/g, ''))}
						inputMode="numeric"
						isLast={true}
					/>
				</View>
				<Text style={settingStyles.description(theme)}>{'Auto download upcoming songs (default: 5)'}</Text >
				<View style={settingStyles.optionsContainer(theme)}>
					<ButtonSwitch
						title="Show if song is cached"
						value={settings.showCache}
						onPress={() => setSettings({ ...settings, showCache: !settings.showCache })}
						isLast={true}
					/>
				</View>
				<View style={settingStyles.optionsContainer(theme)}>
					<ButtonMenu
						title="Clear cache"
						icon="trash"
						onPress={() => confirmAlert(
							'Clear cache',
							'Are you sure you want to clear the cache?',
							async () => {
								await clearCache()
								getStat()
							}
						)}
						isLast={true}
					/>
				</View>
				<Text style={settingStyles.titleContainer(theme)}>Cache Stats</Text >
				<View style={settingStyles.optionsContainer(theme)}>
					{statCache.length === 0 && <View style={settingStyles.optionItem(theme, true)}>
						<Text style={{ color: theme.primaryLight, fontSize: 16, fontWeight: '400' }}>No Cache</Text>
					</View>}
					<FlatList
						data={statCache}
						renderItem={({ item, index }) => (
							<TableItem
								title={item.name}
								value={item.count}
								isLast={index === statCache.length - 1}
							/>
						)}
						keyExtractor={(item, index) => index}
					/>
				</View>
			</View>
		</ScrollView>
	)
}

export default CacheSettings;