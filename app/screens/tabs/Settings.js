import React from 'react';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import md5 from 'md5';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import pkg from '~/../package.json';

import theme from '~/utils/theme';
import mainStyles from '~/styles/main';
import { ConfigContext, SetConfigContext } from '~/utils/config';
import { getApi } from '~/utils/api';
import { clearAllCaches } from '~/services/serviceWorkerRegistration';

const Settings = ({ navigation }) => {
	const [serverUrl, setServerUrl] = React.useState('');
	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [error, setError] = React.useState('');
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const setConfig = React.useContext(SetConfigContext)

	React.useEffect(() => {
		if (config?.url?.length) setServerUrl(config.url)
		if (config?.username?.length) setUsername(config.username)
	}, [config])

	const connect = () => {
		const url = serverUrl.replace(/\/$/, '')
		setServerUrl(url)
		const salt = Math.random().toString(36).substring(2, 15)
		const query = `u=${encodeURI(username)}&t=${md5(password + salt)}&s=${salt}&v=1.16.1&c=sublol&f=json`

		getApi({ url, query }, 'ping.view')
			.then((json) => {
				if (json?.status == 'ok') {
					AsyncStorage.setItem('config.url', url)
					AsyncStorage.setItem('config.user', username)
					AsyncStorage.setItem('config.query', query)
					setConfig({ url, username, query })
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

	return (
		<View style={{ ...mainStyles.mainContainer(insets), alignItems: 'center', justifyContent: 'center' }} >
			<Text style={{ color: theme.secondaryLight, fontSize: 13, marginBottom: 20 }}>Castafiore {pkg.version}</Text>
			<Text style={{ color: theme.primaryTouch, paddingBottom: 20 }} color={theme.primaryLight}>{error}</Text>
			<View style={styles.inputView}>
				<TextInput
					style={styles.inputText}
					placeholder="Server Url"
					value={serverUrl}
					placeholderTextColor={theme.primaryLight}
					onChangeText={(serverUrl) => setServerUrl(serverUrl)}
				/>
			</View>
			<View style={styles.inputView}>
				<TextInput
					style={styles.inputText}
					placeholder="Username"
					placeholderTextColor={theme.primaryLight}
					value={username}
					onChangeText={(username) => setUsername(username)}
				/>
			</View>
			<View style={styles.inputView}>
				<TextInput
					style={styles.inputText}
					placeholder="Password"
					placeholderTextColor={theme.primaryLight}
					secureTextEntry={true}
					value={password}
					onChangeText={(password) => setPassword(password)}
				/>
			</View>
			<TouchableOpacity
				style={styles.loginBtn}
				onPress={connect}
			>
				<Text style={{ color: theme.primaryTouch }}>Connect</Text>
			</TouchableOpacity>
			<TouchableOpacity
				onPress={clearAllCaches}
				style={{ marginTop: 20 }}
			>
				<Text style={{ color: theme.primaryTouch }}>Clear All Cache</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = {
	inputView: {
		width: "80%",
		backgroundColor: theme.secondaryDark,
		borderRadius: 25,
		height: 50,
		marginBottom: 20,
		justifyContent: "center",
		padding: 20,
		borderColor: theme.secondaryLight,
		borderWidth: 1
	},
	inputText: {
		height: 50,
		color: theme.primaryLight
	},
	loginBtn: {
		width: "80%",
		// borderRadius: 25,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
	}
}
export default Settings;