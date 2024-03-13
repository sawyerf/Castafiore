import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import React from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsContext, SetSettingsContext } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import IconButton from '~/components/button/IconButton';
import Header from '~/components/Header';
import HomeOrder from '~/components/Settings/HomeOrder';
import settingStyles from '~/styles/settings';

const HomeSettings = ({ }) => {
	const insets = useSafeAreaInsets()
  const theme = React.useContext(ThemeContext)

	return (
		<ScrollView style={mainStyles.mainContainer(insets, theme)}>
			<Header title="Home" />
			<View
				style={{ ...settingStyles.contentMainContainer(insets), marginTop: 30 }}
			>
				<Text style={settingStyles.titleContainer(theme)}> Home Page</Text >
				<View style={{ ...settingStyles.optionsContainer(theme), marginBottom: 5 }}>
					<HomeOrder />
				</View>
				<Text style={settingStyles.description(theme)}>	{'Select what you want to see on the home page'}</Text >
			</View>
		</ScrollView>
	)
}

export default HomeSettings;