import React from 'react';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext, SetConfigContext } from '~/contexts/config';
import { SettingsContext, SetSettingsContext } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import { themes } from '~/contexts/theme';
import Header from '~/components/Header';
import mainStyles from '~/styles/main';
import settingStyles from '~/styles/settings';

const Theme = ({ navigation }) => {
	const insets = useSafeAreaInsets()
	const config = React.useContext(ConfigContext)
	const setConfig = React.useContext(SetConfigContext)
	const settings = React.useContext(SettingsContext)
	const setSettings = React.useContext(SetSettingsContext)
  const theme = React.useContext(ThemeContext)

	return (
		<ScrollView style={mainStyles.mainContainer(insets, theme)} >
			<Header title="Theme" />
			<View style={settingStyles.contentMainContainer(insets)}>
				<Text style={settingStyles.titleContainer(theme)}>Theme</Text>
				<View style={settingStyles.optionsContainer(theme)}>
					{
						Object.keys(themes).map((themeName, index) => (
							<TouchableOpacity style={settingStyles.optionItem(theme, true)} key={index}
								delayLongPress={200}
								onLongPress={null}
								onPress={() => {
									setSettings({ ...settings, theme: themeName })
								}}>
								<Icon name="tint" size={20} color={themes[themeName].primaryTouch} style={{ marginEnd: 10 }} />
								<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: 16, marginRight: 10, textTransform: 'uppercase', flex: 1, overflow: 'hidden' }}>
									{themeName}
								</Text>
								{(themeName == settings.theme) && <Icon name="check" size={20} color={theme.primaryTouch} />}
							</TouchableOpacity>
						))
					}
				</View>
			</View>
		</ScrollView >
	)
}

export default Theme;