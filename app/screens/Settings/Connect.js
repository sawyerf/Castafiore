import React from 'react';
import { Text, View, ScrollView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import md5 from 'md5';

import { ConfigContext, SetConfigContext } from '~/contexts/config';
import { confirmAlert } from '~/utils/alert';
import { getApi } from '~/utils/api';
import { SettingsContext, SetSettingsContext } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import ButtonText from '~/components/settings/ButtonText';
import Header from '~/components/Header';
import mainStyles from '~/styles/main';
import OptionInput from '~/components/settings/OptionInput';
import OptionsPopup from '~/components/popup/OptionsPopup';
import settingStyles from '~/styles/settings';
import size from '~/styles/size';

const Connect = ({ navigation }) => {
	const insets = useSafeAreaInsets()
	const config = React.useContext(ConfigContext)
	const setConfig = React.useContext(SetConfigContext)
	const settings = React.useContext(SettingsContext)
	const setSettings = React.useContext(SetSettingsContext)
	const theme = React.useContext(ThemeContext)
	const [name, setName] = React.useState('');
	const [url, setUrl] = React.useState('');
	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [error, setError] = React.useState('');
	const [serverOption, setServerOption] = React.useState(null)
	const [info, setInfo] = React.useState(null)

	React.useEffect(() => {
		if (config?.name?.length) setName(config.name)
		else setName('')
		if (config?.url?.length) setUrl(config.url)
		if (config?.username?.length) setUsername(config.username)
	}, [config])


	const upConfig = (conf) => {
		AsyncStorage.setItem('config', JSON.stringify(conf))
		setConfig(conf)
	}

	React.useEffect(() => {
		if (!config?.url) return
		setError('')
		getApi({ url: config.url, query: config.query }, 'ping.view')
			.then((json) => {
				if (json?.status == 'ok') setInfo(json)
			})
			.catch(() => { })
	}, [config])

	const connect = () => {
		const uri = url.replace(/\/$/, '')
		setUrl(uri)
		const salt = Math.random().toString(36).substring(2, 15)
		const query = `u=${encodeURI(username)}&t=${md5(password + salt)}&s=${salt}&v=1.16.1&c=castafiore`

		if (Platform.OS !== 'android' && uri.startsWith('http://')) {
			setError('Only https is allowed')
			return
		}
		getApi({ url: uri, query }, 'ping.view')
			.then((json) => {
				if (json?.status == 'ok') {
					setInfo(json)
					const conf = { name, url: uri, username, query }
					upConfig(conf)
					setError('')
					setSettings({ ...settings, servers: [...settings.servers, conf] })
					navigation.navigate('HomeStack')
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
		<ScrollView
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<Header title="Connect" />
			<View style={[settingStyles.contentMainContainer, { marginTop: 30 }]}>
				<View style={settingStyles.optionsContainer(theme)}>
					<View style={{ flexDirection: 'column', alignItems: 'center', width: '100%', minHeight: 60, marginTop: 20, paddingBottom: 20 }}>
						<View
							style={{
								aspectRatio: 1,
								backgroundColor: theme.primaryTouch,
								borderRadius: 5,
								alignItems: 'center',
								justifyContent: 'center',
								padding: 10,
							}}>
							<Icon name="server" size={size.icon.large} color={theme.innerTouch} />
						</View>
						<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
							{!error.length && <Icon name="circle" size={10} color={info ? 'green' : 'red'} />}
							<Text style={{ color: error.length ? '#ff0000' : theme.primaryText, fontSize: size.text.medium, marginStart: 5 }}>
								{(() => {
									if (error.length) return error
									else if (info) return `${info.type.charAt(0).toUpperCase()}${info.type.slice(1)} ${info.serverVersion}`
									else return 'Not connected'
								})()}
							</Text>
						</View>
					</View>
				</View>
				<View style={[settingStyles.optionsContainer(theme), { marginBottom: 10 }]}>
					<OptionInput
						title="Name"
						placeholder="Name"
						value={name}
						placeholderTextColor={theme.primaryText}
						onChangeText={name => setName(name)}
					/>
					<OptionInput
						title="Url"
						placeholder="Server Url"
						value={url}
						inputMode="url"
						placeholderTextColor={theme.primaryText}
						onChangeText={url => setUrl(url)}
					/>
					<OptionInput
						title="Username"
						placeholder="Username"
						value={username}
						inputMode="text"
						placeholderTextColor={theme.primaryText}
						onChangeText={username => setUsername(username)}
						autoComplete="username"
					/>
					<OptionInput
						title="Password"
						placeholder="Password"
						value={password}
						inputMode="text"
						placeholderTextColor={theme.primaryText}
						onChangeText={password => setPassword(password)}
						isPassword={true}
						autoComplete="current-password"
						isLast={true}
					/>
				</View>
				<ButtonText
					text="Connect"
					onPress={connect}
				/>
				<Text style={settingStyles.titleContainer(theme)}>List of servers</Text>
				<View style={settingStyles.optionsContainer(theme)}>
					{
						settings?.servers?.map((server, index) => (
							<Pressable
								key={index}
								style={({ pressed }) => ([mainStyles.opacity({ pressed }), settingStyles.optionItem(theme, true)])}
								delayLongPress={200}
								onLongPress={() => setServerOption({ ...server, index })}
								onPress={() => {
									upConfig({ name: server.name, url: server.url, username: server.username, query: server.query })
									setPassword('')
								}}>
								<Icon name="server" size={size.icon.tiny} color={theme.secondaryText} style={{ marginEnd: 10 }} />
								<Text numberOfLines={1} style={{ color: theme.primaryText, fontSize: size.text.medium, marginRight: 10, textTransform: 'uppercase', flex: 1, overflow: 'hidden' }}>
									{server.name?.length ? server.name : server.url}
								</Text>
								{(server.query === config.query && server.url === config.url && config.name === server.name) && <Icon name="check" size={size.icon.tiny} color={theme.primaryTouch} />}
							</Pressable>
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
							confirmAlert(
								'Delete server',
								'Are you sure you want to delete this server?',
								() => {
									setSettings({ ...settings, servers: settings.servers.filter((server, index) => index !== serverOption.index) })
									setServerOption(null)
								})
						}
					},
				]}
				visible={serverOption !== null}
				close={() => setServerOption(null)}
			/>

		</ScrollView >
	)
}

export default Connect;