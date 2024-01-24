import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import md5 from 'md5';
import { Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext, SetConfigContext } from '~/contexts/config';
import { SettingsContext, SetSettingsContext } from '~/contexts/settings';
import { clearAllCaches, clearCache } from '~/services/serviceWorkerRegistration';
import { getApi } from '~/utils/api';
import mainStyles from '~/styles/main';
import theme from '~/utils/theme';
import Header from '~/components/Header';
import settingStyles from '~/styles/settings';
import OptionInput from '~/components/Settings/OptionInput';
import OptionsPopup from '~/components/popup/OptionsPopup';

const Connect = ({ navigation }) => {
	const insets = useSafeAreaInsets()
	const [name, setName] = React.useState('');
	const [url, setUrl] = React.useState('');
	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [error, setError] = React.useState('');
	const config = React.useContext(ConfigContext)
	const setConfig = React.useContext(SetConfigContext)
	const settings = React.useContext(SettingsContext)
	const setSettings = React.useContext(SetSettingsContext)
	const [serverOption, setServerOption] = React.useState(null)

	React.useEffect(() => {
		if (config?.name?.length) setName(config.name)
		else setName('')
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
					const conf = { name, url: uri, username, query }
					AsyncStorage.setItem('config', JSON.stringify(conf))
					setConfig(conf)
					setError('')
					setSettings({ ...settings, servers: [...settings.servers, conf] })
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
		<ScrollView style={mainStyles.mainContainer(insets)} >
			<Header title="Connect" />
			<View style={settingStyles.contentMainContainer(insets)}>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'center',
						width: '100%',
						minHeight: 60,
						alignItems: 'center',
					}}
				>
					<Text style={{ color: theme.primaryTouch, paddingBottom: 20 }} color={theme.primaryLight}>{error}</Text>
				</View>
				<View style={settingStyles.optionsContainer}>
					<OptionInput
						style={mainStyles.inputSetting}
						title="Name"
						placeholder="Name"
						value={name}
						placeholderTextColor={theme.primaryLight}
						onChangeText={name => setName(name)}
					/>
					<OptionInput
						style={mainStyles.inputSetting}
						title="Url"
						placeholder="Server Url"
						value={url}
						inputMode="url"
						placeholderTextColor={theme.primaryLight}
						onChangeText={url => setUrl(url)}
					/>
					<OptionInput
						style={mainStyles.inputSetting}
						title="Username"
						placeholder="Username"
						value={username}
						inputMode="url"
						placeholderTextColor={theme.primaryLight}
						onChangeText={username => setUsername(username)}
					/>
					<OptionInput
						style={mainStyles.inputSetting}
						title="Password"
						placeholder="Password"
						value={password}
						inputMode="url"
						placeholderTextColor={theme.primaryLight}
						onChangeText={password => setPassword(password)}
						isPassword={true}
						isLast={true}
					/>
				</View>
				<View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%', marginBottom: 20 }}>
					<TouchableOpacity
						style={styles.loginBtn}
						onPress={connect}
					>
						<Text style={{ color: theme.primaryTouch, fontSize: 17 }}>Connect</Text>
					</TouchableOpacity>
				</View>

				<Text style={settingStyles.titleContainer}>List of servers</Text>
				<View style={settingStyles.optionsContainer}>
					{
						settings?.servers?.map((server, index) => (
							<TouchableOpacity style={settingStyles.optionItem(true)} key={index}
								delayLongPress={200}
								onLongPress={() => setServerOption({ ...server, index })}
								onPress={() => {
									setConfig({ name: server.name, url: server.url, username: server.username, query: server.query })
									setPassword('')
								}}>
								<Icon name="server" size={20} color={theme.secondaryLight} style={{ marginEnd: 10 }} />
								<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: 16, marginRight: 10, textTransform: 'uppercase', flex: 1, overflow: 'hidden' }}>
									{server.name?.length ? server.name : server.url}
								</Text>
								{(server.query === config.query && server.url === config.url && config.name === server.name) && <Icon name="check" size={20} color={theme.primaryTouch} />}
							</TouchableOpacity>
						))
					}
				</View>
			</View>
			<OptionsPopup
				options={[
					{
						name: 'Delete',
						icon: 'trash',
						onPress: () => {
							setSettings({ ...settings, servers: settings.servers.filter((server, index) => index !== serverOption.index) })
							setServerOption(null)
						}
					},
				]}
				visible={serverOption !== null}
				close={() => setServerOption(null)}
			/>

		</ScrollView >
	)
}

const styles = {
	loginBtn: {
		// width: "80%",
		width: '100%',
		height: 50,
		alignItems: "center",
		justifyContent: "center",
	}
}

export default Connect;