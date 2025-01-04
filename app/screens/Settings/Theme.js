import React from 'react';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import { SettingsContext, SetSettingsContext } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import { themes } from '~/contexts/theme';
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
			style={mainStyles.mainContainer(insets, theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<Header title="Theme" />
			<View style={{ ...settingStyles.contentMainContainer(insets), marginTop: 30 }}>
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
			</View>
		</ScrollView >
	)
}

export default Theme;