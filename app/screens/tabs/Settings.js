import React from 'react';
import pkg from '~/../package.json';
import { Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext, SetConfigContext } from '~/contexts/config';
import { SetSettingsContext } from '~/contexts/settings';
import { clearAllCaches, clearCache } from '~/services/serviceWorkerRegistration';
import { defaultSettings } from '~/contexts/settings';
import HomeOrder from '~/components/Settings/HomeOrder';
import MaxCache from '~/components/Settings/MaxCache';
import mainStyles from '~/styles/main';
import theme from '~/utils/theme';
import Connect from '~/components/Settings/Connect';

const Settings = ({ navigation }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const setSettings = React.useContext(SetSettingsContext)

	return (
		<ScrollView
			style={{ ...mainStyles.mainContainer(insets) }}
			contentContainerStyle={{
				...mainStyles.contentMainContainer(insets),
				maxWidth: 500,
				width: '100%',
				alignItems: 'center',
				justifyContent: 'center',
				paddingHorizontal: 20,
				alignSelf: 'center',
			}}
		>
			<Text style={{ color: theme.secondaryLight, fontSize: 13, marginBottom: 20, marginTop: 30 }}>Castafiore {pkg.version}</Text>
			<Connect navigation={navigation} />
			<TouchableOpacity
				onPress={clearAllCaches}
				style={{ marginTop: 20 }}
			>
				<Text style={{ color: theme.primaryTouch }}>Clear All Cache</Text>
			</TouchableOpacity>
			<TouchableOpacity
				onPress={() => setSettings(defaultSettings)}
				style={{ marginTop: 20 }}
			>
				<Text style={{ color: theme.primaryTouch }}>Reset Settings</Text>
			</TouchableOpacity>
			{config.query && (
				<>
					<MaxCache />
					<HomeOrder />
				</>
			)}
		</ScrollView>
	)
}

export default Settings;