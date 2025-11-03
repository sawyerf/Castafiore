import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { clearCache, clearSongCache, getStatCache } from '~/utils/cache'
import { confirmAlert } from '~/utils/alert'
import { SettingsContext, SetSettingsContext } from '~/contexts/settings'
import { ThemeContext } from '~/contexts/theme'
import ButtonMenu from '~/components/settings/ButtonMenu'
import ButtonSwitch from '~/components/settings/ButtonSwitch'
import Header from '~/components/Header'
import ListMap from '~/components/lists/ListMap'
import mainStyles from '~/styles/main'
import OptionInput from '~/components/settings/OptionInput'
import settingStyles from '~/styles/settings'
import size from '~/styles/size';
import TableItem from '~/components/settings/TableItem'

const CacheSettings = () => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const settings = React.useContext(SettingsContext)
	const setSettings = React.useContext(SetSettingsContext)
	const theme = React.useContext(ThemeContext)
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

	return (
		<ScrollView
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<Header title={t("Cache")} />
			<View style={settingStyles.contentMainContainer}>
				<Text style={settingStyles.titleContainer(theme)}>{t('settings.cache.Song caching')}</Text>
				<View style={[settingStyles.optionsContainer(theme), { marginBottom: 5 }]}>
					<ButtonSwitch
						title={t("settings.cache.Enable song caching")}
						value={settings.isSongCaching}
						onPress={() => setSettings({ ...settings, isSongCaching: !settings.isSongCaching })}
					/>
					<ButtonSwitch
						title={t("settings.cache.Show cached songs")}
						value={settings.showCache}
						onPress={() => setSettings({ ...settings, showCache: !settings.showCache })}
					/>
					<OptionInput
						title={t("settings.cache.Cache next song")}
						value={settings.cacheNextSong.toString()}
						onChangeText={(text) => {
							const cleanedText = text.replace(/[^0-9]/g, '')
							const number = cleanedText === '' ? 0 : parseInt(cleanedText)
							setSettings({ ...settings, cacheNextSong: number })
						}}
						inputMode="numeric"
						isLast
					/>
				</View>
				<Text style={settingStyles.description(theme)}>{t('settings.cache.Cache next song description')}</Text>
				<Text style={settingStyles.titleContainer(theme)}>{t('settings.cache.Max cache size')}</Text>
				<View style={[settingStyles.optionsContainer(theme), { marginBottom: 5 }]}>
					<ButtonSwitch
						title={t("settings.cache.Enable max cache size")}
						value={settings.enableMaxCacheSize}
						onPress={() => setSettings({ ...settings, enableMaxCacheSize: !settings.enableMaxCacheSize })}
					/>
					<OptionInput
						title={t("settings.cache.Max cache size GB")}
						value={settings.maxCacheSize.toString()}
						onChangeText={(text) => {
							const cleanedText = text.replace(/[^0-9]/g, '')
							const number = cleanedText === '' ? 0 : parseInt(cleanedText)
							setSettings({ ...settings, maxCacheSize: number })
						}}
						inputMode="numeric"
						disable={!settings.enableMaxCacheSize}
						isLast
					/>
				</View>
				<Text style={settingStyles.description(theme)}>{t('settings.cache.Max cache size description')}</Text>
				<Text style={settingStyles.titleContainer(theme)}>{t('settings.cache.Clear cache')}</Text>
				<View style={settingStyles.optionsContainer(theme)}>
					<ButtonMenu
						title={t("settings.cache.Clear API cache")}
						icon="trash"
						onPress={() => confirmAlert(
							t('settings.cache.Clear API cache'),
							t('settings.cache.Clear API cache alert message'),
							async () => {
								await clearCache()
								getStat()
							}
						)}
					/>
					<ButtonMenu
						title={t("settings.cache.Clear song cache")}
						icon="trash"
						onPress={() => confirmAlert(
							t('settings.cache.Clear song cache'),
							t('settings.cache.Clear cache alert message'),
							async () => {
								await clearSongCache()
								getStat()
							}
						)}
						isLast
					/>
				</View>
				<Text style={settingStyles.titleContainer(theme)}>{t('settings.cache.Cache stats')}</Text>
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
								<Text style={{ color: theme.primaryText, fontSize: size.text.medium, fontWeight: '400' }}>{t('settings.cache.No cache')}</Text>
							</View>
						)}
					/>
				</View>
			</View>
		</ScrollView>
	)
}

export default CacheSettings;