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
import settings from '../../styles/settings';

const HomeSettings = ({ }) => {
	const insets = useSafeAreaInsets()

	return (
		<View style={mainStyles.mainContainer(insets)}>
			<Header title="Home" />
			<View
				style={settings.contentMainContainer(insets)}
			>
				<HomeOrder />
			</View>
		</View>
	)
}

export default HomeSettings;