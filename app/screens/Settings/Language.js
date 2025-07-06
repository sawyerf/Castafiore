import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsContext, SetSettingsContext } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import Header from '~/components/Header';
import mainStyles from '~/styles/main';
import settingStyles from '~/styles/settings';
import SelectItem from '~/components/settings/SelectItem';

const languages = [
	{ lang: 'en', name: 'English' },
	{ lang: 'fr', name: 'Français' },
]

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
			<Header title="Language" />
			<View style={[settingStyles.contentMainContainer, { marginTop: 30 }]}>
				<Text style={settingStyles.titleContainer(theme)}>Language</Text>
				<View style={settingStyles.optionsContainer(theme)}>
					{
						languages.map((lang, index) => (
							<SelectItem
								key={index}
								text={lang.name}
								icon="flag"
								isSelect={lang.lang == settings.language}
								onPress={() => {
									setSettings({ ...settings, language: lang.lang })
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