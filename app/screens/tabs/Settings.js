import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import React from 'react';
import md5 from 'md5';
import pkg from '~/../package.json';
import { Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext, SetConfigContext } from '~/contexts/config';
import { SetSettingsContext } from '~/contexts/settings';
import { clearAllCaches, clearCache } from '~/services/serviceWorkerRegistration';
import { defaultSettings } from '~/contexts/settings';
import { getApi } from '~/utils/api';
import HomeOrder from '~/components/Settings/HomeOrder';
import MaxCache from '~/components/Settings/MaxCache';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import theme from '~/utils/theme';

const Settings = ({ navigation }) => {
	const [url, setUrl] = React.useState('');
	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [error, setError] = React.useState('');
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const setConfig = React.useContext(SetConfigContext)
	const setSettings = React.useContext(SetSettingsContext)

	React.useEffect(() => {
		if (config?.url?.length) setUrl(config.url)
		if (config?.username?.length) setUsername(config.username)
	}, [config])

	const connect = () => {
		const uri = url.replace(/\/$/, '')
		setUrl(uri)
		const salt = Math.random().toString(36).substring(2, 15)
		const query = `u=${encodeURI(username)}&t=${md5(password + salt)}&s=${salt}&v=1.16.1&c=castafiore&f=json`

		getApi({ url: uri, query }, 'ping.view')
			.then((json) => {
				if (json?.status == 'ok') {
					AsyncStorage.setItem('config', JSON.stringify({ url: uri, username, query }))
					setConfig({ url: uri, username, query })
					setError('')
					navigation.navigate('Home')
				} else {
					console.log('Connect api error:', json)
				}
			})
			.catch((error) => {
				console.log('Connect error:', error)
				if (error.isApiError) setError(error.message)
				else setError('Failed to connect to server')
			})
	}

	const disconnect = () => {
		AsyncStorage.removeItem('config')
		setConfig({ url, username, query: null })
		setError('')
		clearCache()
	}

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
			<Text style={{ color: theme.primaryTouch, paddingBottom: 20 }} color={theme.primaryLight}>{error}</Text>
			<TextInput
				style={mainStyles.inputSetting}
				placeholder="Server Url"
				value={url}
				placeholderTextColor={theme.primaryLight}
				autoFocus={false}
				onChangeText={(url) => setUrl(url)}
			/>
			<TextInput
				style={mainStyles.inputSetting}
				placeholder="Username"
				placeholderTextColor={theme.primaryLight}
				value={username}
				onChangeText={(username) => setUsername(username)}
			/>
			<TextInput
				style={mainStyles.inputSetting}
				placeholder="Password"
				placeholderTextColor={theme.primaryLight}
				secureTextEntry={true}
				value={password}
				onSubmitEditing={connect}
				onChangeText={(password) => setPassword(password)}
			/>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
				<TouchableOpacity
					style={styles.loginBtn}
					onPress={connect}
				>
					<Text style={{ color: theme.primaryTouch }}>Connect</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={disconnect}
					style={styles.loginBtn}
				>
					<Text style={{ color: theme.primaryTouch }}>Disconnect</Text>
				</TouchableOpacity>
			</View>
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

const styles = {
	loginBtn: {
		// width: "80%",
		flex: 1,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
	}
}
export default Settings;