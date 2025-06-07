import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsContext, SetSettingsContext } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import { themes, themesPlayer } from '~/contexts/theme';
import Header from '~/components/Header';
import mainStyles from '~/styles/main';
import settingStyles from '~/styles/settings';
import SelectItem from '~/components/settings/SelectItem';

const Theme = () => {
	const insets = useSafeAreaInsets()
	const settings = React.useContext(SettingsContext)
	const setSettings = React.useContext(SetSettingsContext)
	const theme = React.useContext(ThemeContext)

	return (
		<ScrollView
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<Header title="Theme" />
			<View style={[settingStyles.contentMainContainer, { marginTop: 30 }]}>
				<Text style={settingStyles.titleContainer(theme)}>Theme</Text>
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
				<Text style={settingStyles.titleContainer(theme)}>Player Theme</Text>
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

export default Theme;