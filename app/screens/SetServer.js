import React from 'react';
import { Text, View, Button, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import md5 from 'md5';

const SetServer = ({ navigation }) => {
	const [serverUrl, setServerUrl] = React.useState('');
	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState('');

	React.useEffect(() => {
		AsyncStorage.getItem('config.url')
			.then((configUrl) => {
				console.log('configUrl', configUrl)
				setServerUrl(configUrl)
				if (configUrl) {
					navigation.navigate('Home')
				}
			})
	}, [])
	const stringToHex = (str) => {
		let hex = '';
		for (let i = 0; i < str.length; i++) {
			const charCode = str.charCodeAt(i);
			const hexValue = charCode.toString(16);

			hex += hexValue.padStart(2, '0');
		}
		return hex;
	};
	const connect = async () => {
		const query = 'u=' + username + '&t=' + md5(password + '123456') + '&s=' + '123456' + '&v=1.16.1&c=sublol&f=json'
		const res = await fetch(
			serverUrl + '/rest/ping.view?' + query,
		)
		console.log('res', res.status);
		console.log('cookie', res.headers.get('set-cookie'));
		console.log('body', await res.json())
		if (res.status === 200) {
			navigation.navigate('Home')
			await AsyncStorage.setItem('config.url', serverUrl)
			await AsyncStorage.setItem('config.query', query)
		}
	}

	return (
		<View style={{ flex: 1, backgroundColor: '#0e0e0e', alignItems: 'center', justifyContent: 'center' }} >
			<View style={styles.inputView}>
				<TextInput
					style={styles.inputText}
					placeholder="Server Url"
					value={serverUrl}
					placeholderTextColor="white"
					onChangeText={(serverUrl) => setServerUrl(serverUrl)}
				/>
			</View>
			<View style={styles.inputView}>
				<TextInput
					style={styles.inputText}
					placeholder="Username"
					placeholderTextColor="white"
					value={username}
					onChangeText={(username) => setUsername(username)}
				/>
			</View>
			<View style={styles.inputView}>
				<TextInput
					style={styles.inputText}
					placeholder="Password"
					placeholderTextColor="white"
					secureTextEntry={true}
					value={password}
					onChangeText={(password) => setPassword(password)}
				/>
			</View>
			<Button
				style={styles.loginBtn}
				title="Connect"
				onPress={connect}
			/>
		</View>
	)
}

const styles = {
	inputView: {
		width: "80%",
		backgroundColor: "#121212",
		borderRadius: 25,
		height: 50,
		marginBottom: 20,
		justifyContent: "center",
		padding: 20,
		borderColor: "white",
		borderWidth: 1
	},
	inputText: {
		height: 50,
		color: "white"
	},
	loginBtn: {
		width: "80%",
		backgroundColor: "#fb5b5a",
		borderRadius: 25,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 40,
		marginBottom: 10
	}
}
export default SetServer;