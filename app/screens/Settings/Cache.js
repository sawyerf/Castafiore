import React from 'react'
import { View, Text, ScrollView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome'

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
import ListMap from '~/components/lists/ListMap'

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
		if (number === settings.cacheNextSong) return
		setSettings({ ...settings, cacheNextSong: number })
	}, [cacheNextSong])

	return (
		<ScrollView
			style={mainStyles.mainContainer(insets, theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<Header title="Cache" />

			<View style={[settingStyles.contentMainContainer, { marginTop: 30 }]}>
				{
					Platform.OS === 'android' &&
					<View style={settingStyles.optionsContainer(theme)}>
						<View style={[settingStyles.optionItem(theme, true), { height: undefined }]}>
							<Icon
								name={'warning'}
								size={18}
								color={'yellow'}
								style={{ marginEnd: 10 }}
							/>
							<Text style={[settingStyles.primaryText(theme), { textAlign: 'center', marginVertical: 15 }]}>Song caching is not yet supported on Android.</Text>
							<Icon
								name={'warning'}
								size={18}
								color={'yellow'}
								style={{ marginStart: 10 }}
							/>
						</View>
					</View>
				}
				<Text style={settingStyles.titleContainer(theme)}>Auto Cache</Text >
				<View style={[settingStyles.optionsContainer(theme), { marginBottom: 5 }]}>
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
					<ListMap
						data={statCache}
						renderItem={(item, index) => (
							<TableItem
								key={index}
								title={item.name}
								value={item.count}
								isLast={index === statCache.length - 1}
							/>
						)}
						ListEmptyComponent={(
							<View style={settingStyles.optionItem(theme, true)}>
								<Text style={{ color: theme.primaryLight, fontSize: 16, fontWeight: '400' }}>No Cache</Text>
							</View>
						)}
					/>
				</View>
			</View>
		</ScrollView>
	)
}

export default CacheSettings;