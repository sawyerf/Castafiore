import React from 'react';
import { Text, View, Button, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import md5 from 'md5';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import theme from '../../utils/theme';
import mainStyles from '../../styles/main';

const Settings = ({ navigation }) => {
	const [serverUrl, setServerUrl] = React.useState('');
	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [error, setError] = React.useState('');
	const insets = useSafeAreaInsets();

	React.useEffect(() => {
		AsyncStorage.getItem('config.url')
			.then((configUrl) => {
				if (configUrl?.length) {
					setServerUrl(configUrl)
				}
			})
	}, [])

	const connect = () => {
		const url = serverUrl.replace(/\/$/, '')
		setServerUrl(url)
		const salt = Math.random().toString(36).substring(2, 15)
		const query = `u=${encodeURI(username)}&t=${md5(password + salt)}&s=${salt}&v=1.16.1&c=sublol&f=json`
		fetch(`${url}/rest/ping.view?${query}`)
			.then((res) => res.status == 200 ? res.json() : undefined)
			.then((json) => {
				if (json?.['subsonic-response']?.status == 'ok') {
					AsyncStorage.setItem('config.url', url)
					AsyncStorage.setItem('config.user', username)
					AsyncStorage.setItem('config.query', query)
					navigation.navigate('Home')
				} else if (json && json['subsonic-response']?.error) {
					console.log('error message', json['subsonic-response'].error)
					setError(json['subsonic-response'].error.message)
				} else {
					console.log('error', json)
				}
			})
			.catch((error) => {
				console.log('error', error)
			})
	}

	return (
		<View style={{ ...mainStyles.mainContainer(insets), alignItems: 'center', justifyContent: 'center' }} >
			<Text style={{ color: theme.primaryTouch }} color={theme.primaryLight}>{error}</Text>
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
			<Button
				style={styles.loginBtn}
				title="Connect"
				color={theme.primaryTouch}
				onPress={connect}
			/>
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
		// backgroundColor: "#fb5b5a",
		borderRadius: 25,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 40,
		marginBottom: 10
	}
}
export default Settings;