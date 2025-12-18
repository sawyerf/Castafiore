import React from 'react'
import { Text, View, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { useSettings, useSetSettings } from '~/contexts/settings'
import { useTheme } from '~/contexts/theme'
import { themes, themesPlayer } from '~/contexts/theme'
import Header from '~/components/Header'
import mainStyles from '~/styles/main'
import settingStyles from '~/styles/settings'
import SelectItem from '~/components/settings/SelectItem'

const Theme = () => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const settings = useSettings()
	const setSettings = useSetSettings()
	const theme = useTheme()

	return (
		<ScrollView
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<Header title={t("Theme")} />
			<View style={settingStyles.contentMainContainer}>
				<Text style={settingStyles.titleContainer(theme)}>{t('Theme')}</Text>
				<View style={settingStyles.optionsContainer(theme)}>
					{
						Object.keys(themes).map((themeName, index) => (
							<SelectItem
								key={index}
								text={themeName}
								icon="tint"
								colorIcon={themes[themeName].primaryTouch}
								isSelect={themeName == settings.theme}
								onPress={() => {
									setSettings({ ...settings, theme: themeName })
								}}
							/>
						))
					}
				</View>
				<Text style={settingStyles.titleContainer(theme)}>{t('settings.theme.Player Theme')}</Text>
				<View style={settingStyles.optionsContainer(theme)}>
					{
						Object.keys(themesPlayer).map((themeName, index) => (
							<SelectItem
								key={index}
								text={themeName}
								icon="tint"
								colorIcon={themesPlayer[themeName].playerBackground}
								isSelect={themeName == settings.themePlayer}
								onPress={() => {
									setSettings({ ...settings, themePlayer: themeName })
								}}
							/>
						))
					}
				</View>
			</View>
		</ScrollView>
	)
}

export default Theme