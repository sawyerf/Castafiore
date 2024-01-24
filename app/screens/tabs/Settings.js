import React from 'react';
import pkg from '~/../package.json';
import { Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext, SetConfigContext } from '~/contexts/config';
import { SetSettingsContext, defaultSettings } from '~/contexts/settings';
import mainStyles from '~/styles/main';
import theme from '~/utils/theme';
import settingsStyle from '~/styles/settings';
import ButtonMenu from '~/components/Settings/ButtonMenu';

const Settings = ({ navigation }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const setSettings = React.useContext(SetSettingsContext)

	return (
		<ScrollView
			style={{ ...mainStyles.mainContainer(insets) }}
			contentContainerStyle={settingsStyle.contentMainContainer(insets)}
		>
			<Text style={{ color: theme.secondaryLight, fontSize: 13, marginBottom: 20, marginTop: 30 }}>Castafiore {pkg.version}</Text>
			{/* sub menu */}
			<View style={settingsStyle.optionsContainer} >
				<ButtonMenu
					title="Connect"
					endText={config.query ? (config.name?.length ? config.name : 'Connected') : 'Not connected'}
					icon="server"
					onPress={() => navigation.navigate('Connect')}
					isLast={true}
				/>
			</View>

			<View style={settingsStyle.optionsContainer} >
				<ButtonMenu
					title="Home"
					icon="home"
					onPress={() => navigation.navigate('Settings/Home')}
				/>
				<ButtonMenu
					title="Cache"
					icon="database"
					onPress={() => navigation.navigate('Settings/Cache')}
					isLast={true}
				/>
			</View>

			<View style={settingsStyle.optionsContainer} >
				<ButtonMenu
					title="Reset Settings"
					icon="undo"
					onPress={() => setSettings(defaultSettings)}
					isLast={true}
				/>
			</View>
		</ScrollView>
	)
}

export default Settings;