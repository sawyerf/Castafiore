import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { SettingsContext } from '~/contexts/settings'
import { SetSettingsContext } from '~/contexts/settings'
import { ThemeContext } from '~/contexts/theme'
import ButtonSwitch from '~/components/settings/ButtonSwitch'
import Header from '~/components/Header'
import mainStyles from '~/styles/main'
import SelectItem from '~/components/settings/SelectItem'
import settingStyles from '~/styles/settings'

const FORMATS = [
	{ name: 'Raw', value: 'raw' },
	{ name: 'MP3', value: 'mp3' },
	{ name: 'AAC', value: 'aac' },
	{ name: 'Opus', value: 'opus' },
]

const BITRATES = [
	{ name: 'Default', value: 0 },
	{ name: '32', value: 32 },
	{ name: '48', value: 48 },
	{ name: '64', value: 64 },
	{ name: '80', value: 80 },
	{ name: '96', value: 96 },
	{ name: '112', value: 112 },
	{ name: '128', value: 128 },
	{ name: '160', value: 160 },
	{ name: '192', value: 192 },
	{ name: '256', value: 256 },
	{ name: '320', value: 320 },
]

const PlayerSettings = () => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const theme = React.useContext(ThemeContext)
	const settings = React.useContext(SettingsContext)
	const setSettings = React.useContext(SetSettingsContext)

	return (
		<ScrollView
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<Header title={t("Player")} />

			<View style={settingStyles.contentMainContainer}>
				<Text style={settingStyles.titleContainer(theme)}>{t('settings.player.Stream format')}</Text>
				<View style={[settingStyles.optionsContainer(theme), { marginBottom: 5 }]}>
					{FORMATS.map((item, index) => (
						<SelectItem
							key={index}
							text={item.name}
							icon={'file-audio-o'}
							isSelect={item.value === settings.streamFormat}
							onPress={() => {
								setSettings({ ...settings, streamFormat: item.value })
							}}
						/>
					))}
				</View>
				<Text style={settingStyles.description(theme)}>{t('settings.player.Stream format Description')}</Text>

				<Text style={settingStyles.titleContainer(theme)}>{t('settings.player.Max bitrate')}</Text>
				<View style={[settingStyles.optionsContainer(theme), { marginBottom: 5 }]}>
					{
						BITRATES.map((item, index) => (
							<SelectItem
								key={index}
								text={item.name}
								icon={'tachometer'}
								isSelect={item.value === settings.maxBitRate}
								onPress={() => {
									setSettings({ ...settings, maxBitRate: item.value })
								}}
								disabled={settings.streamFormat === 'raw'}
							/>
						))
					}
				</View>
				<Text style={settingStyles.description(theme)}>{t('settings.player.Max bitrate Description')}</Text>

				<Text style={settingStyles.titleContainer(theme)}>{t('Play similar songs')}</Text>
				<View style={settingStyles.optionsContainer(theme)}>
					<ButtonSwitch
						title={t('settings.player.Play seed first')}
						value={settings.playSeedFirst}
						onPress={() => setSettings({ ...settings, playSeedFirst: !settings.playSeedFirst })}
						isLast
					/>
				</View>
				<Text style={settingStyles.titleContainer(theme)}>{t('Queue')}</Text>
				<View style={settingStyles.optionsContainer(theme, true)}>
					<ButtonSwitch
						title={t('Enable repeat queue')}
						value={settings.repeatQueue}
						onPress={() => setSettings({ ...settings, repeatQueue: !settings.repeatQueue })}
					/>
					<ButtonSwitch
						title={t('settings.player.Save last queue')}
						value={settings.saveQueue}
						onPress={() => setSettings({ ...settings, saveQueue: !settings.saveQueue })}
						isLast
					/>
				</View>
				<Text style={settingStyles.description(theme)}>{t('settings.player.Save last queue Description')}</Text>
			</View>
		</ScrollView>
	)
}

export default PlayerSettings