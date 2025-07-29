import React from 'react';
import { Text, View, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import md5 from 'md5';

import { SetConfigContext } from '~/contexts/config';
import { getApi } from '~/utils/api';
import { SettingsContext, SetSettingsContext } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import ButtonText from '~/components/settings/ButtonText';
import ButtonSwitch from '~/components/settings/ButtonSwitch';
import Header from '~/components/Header';
import mainStyles from '~/styles/main';
import OptionInput from '~/components/settings/OptionInput';
import settingStyles from '~/styles/settings';
import size from '~/styles/size';

const AddServer = ({ navigation }) => {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets()
	const setConfig = React.useContext(SetConfigContext)
	const settings = React.useContext(SettingsContext)
	const setSettings = React.useContext(SetSettingsContext)
	const theme = React.useContext(ThemeContext)
	const [name, setName] = React.useState('');
	const [url, setUrl] = React.useState('');
	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [error, setError] = React.useState('');
	const [info, setInfo] = React.useState(null)
	const [showPassword, setShowPassword] = React.useState(false)
	const [lowSecurity, setLowSecurity] = React.useState(false)

	const upConfig = (conf) => {
		AsyncStorage.setItem('config', JSON.stringify(conf))
		setConfig(conf)
	}

	const connect = () => {
		const uri = url.replace(/\/$/, '')
		setUrl(uri)
		const salt = Math.random().toString(36).substring(2, 15)

		let query;
		if (lowSecurity) {
			query = `u=${encodeURI(username)}&p=${encodeURI(password)}&v=1.16.1&c=castafiore`
		} else {
			query = `u=${encodeURI(username)}&t=${md5(password + salt)}&s=${salt}&v=1.16.1&c=castafiore`
		}

		if (Platform.OS !== 'android' && uri.startsWith('http://')) {
			setError('Only https is allowed')
			return
		}
		getApi({ url: uri, query }, 'ping.view')
			.then((json) => {
				if (json?.status == 'ok') {
					setInfo(json)
					const conf = { name, url: uri, username, query, type: json.type }
					upConfig(conf)
					setError('')
					setSettings({ ...settings, servers: [...settings.servers, conf] })
					navigation.goBack()
					navigation.navigate('HomeStack')
				} else {
					console.log('Connect api error:', json)
				}
			})
			.catch((error) => {
				console.log('Connect error:', error)
				if (error.isApiError || error.message) setError(error.message)
				else setError('Failed to connect to server')
			})
	}

	return (
		<ScrollView
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<Header title={t("Connect")} />
			<View style={settingStyles.contentMainContainer}>
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
									else return t('Not connected')
								})()}
							</Text>
						</View>
					</View>
				</View>
				<View style={[settingStyles.optionsContainer(theme), { marginBottom: 10 }]}>
					<OptionInput
						title={t("Name")}
						placeholder={t("Name")}
						value={name}
						placeholderTextColor={theme.primaryText}
						onChangeText={name => setName(name)}
					/>
					<OptionInput
						title={t("Url")}
						placeholder={t("Server Url")}
						value={url}
						inputMode="url"
						placeholderTextColor={theme.primaryText}
						onChangeText={url => setUrl(url)}
					/>
					<OptionInput
						title={t("Username")}
						placeholder={t("Username")}
						value={username}
						inputMode="text"
						placeholderTextColor={theme.primaryText}
						onChangeText={username => setUsername(username)}
						autoComplete="username"
					/>
					<OptionInput
						title={t("Password")}
						placeholder={t("Password")}
						value={password}
						inputMode="text"
						placeholderTextColor={theme.primaryText}
						onChangeText={password => setPassword(password)}
						isPassword={true}
						secureTextEntry={!showPassword}
						autoComplete="current-password"
						isLast
					/>
				</View>
				<View style={[settingStyles.optionsContainer(theme), { marginTop: 10, marginBottom: 5 }]}>
					<ButtonSwitch
						title={t("settings.connect.Show Password")}
						value={showPassword}
						onPress={() => setShowPassword(!showPassword)}
						isLast
					/>
				</View>
				<View style={[settingStyles.optionsContainer(theme), { marginTop: 10, marginBottom: 5 }]}>
					<ButtonSwitch
						title={t("settings.connect.Legacy authentication")}
						value={lowSecurity}
						onPress={() => setLowSecurity(!lowSecurity)}
						isLast
					/>
				</View>
				<Text style={settingStyles.description(theme)}>
					{t('settings.connect.Legacy Description')}
				</Text>
				<ButtonText
					text={t("settings.connect.Connect")}
					onPress={connect}
				/>
			</View>
		</ScrollView>
	)
}

export default AddServer;
