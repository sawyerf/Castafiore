import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import React from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsContext, SetSettingsContext } from '~/contexts/settings';
import theme from '~/utils/theme';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import IconButton from '~/components/button/IconButton';
import Header from '~/components/Header';
import HomeOrder from '~/components/Settings/HomeOrder';
import settingStyles from '~/styles/settings';

const HomeSettings = ({ }) => {
	const insets = useSafeAreaInsets()

	return (
		<ScrollView style={mainStyles.mainContainer(insets)}>
			<Header title="Home" />
			<View
				style={{ ...settingStyles.contentMainContainer(insets), marginTop: 30 }}
			>
				<Text style={settingStyles.titleContainer}> Home Page</Text >
				<View style={{ ...settingStyles.optionsContainer, marginBottom: 5 }}>
					<HomeOrder />
				</View>
				<Text style={settingStyles.description}>	{'Select what you want to see on the home page'}</Text >
			</View>
		</ScrollView>
	)
}

export default HomeSettings;