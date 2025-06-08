import React from 'react';
import { Text, View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext, SetConfigContext } from '~/contexts/config';
import { confirmAlert } from '~/utils/alert';
import { getApi } from '~/utils/api';
import { SettingsContext, SetSettingsContext, demoServers } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import Header from '~/components/Header';
import mainStyles from '~/styles/main';
import OptionsPopup from '~/components/popup/OptionsPopup';
import TableItem from '~/components/settings/TableItem';
import ButtonText from '~/components/settings/ButtonText';
import settingStyles from '~/styles/settings';
import size from '~/styles/size';

const Connect = ({ navigation }) => {
	const insets = useSafeAreaInsets()
	const config = React.useContext(ConfigContext)
	const setConfig = React.useContext(SetConfigContext)
	const settings = React.useContext(SettingsContext)
	const setSettings = React.useContext(SetSettingsContext)
	const theme = React.useContext(ThemeContext)
	const [error, setError] = React.useState('');
	const [serverOption, setServerOption] = React.useState(null)
	const [info, setInfo] = React.useState(null)

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
				{config.url && (
					<>
						<Text style={settingStyles.titleContainer(theme)}>Current server</Text>
						<View style={settingStyles.optionsContainer(theme)}>
							<TableItem title="Name" value={config.name} />
							<TableItem title="Url" value={config.url} />
							<TableItem title="Username" value={config.username} isLast />
						</View>
					</>
				)}
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
									upConfig(server)
								}}>
								<Icon name="server" size={size.icon.tiny} color={theme.secondaryText} style={{ marginEnd: 10 }} />
								<Text numberOfLines={1} style={{ color: theme.primaryText, fontSize: size.text.medium, marginRight: 10, textTransform: 'uppercase', flex: 1, overflow: 'hidden' }}>
									{server.name?.length ? server.name : server.url}
								</Text>
								{(server.query === config.query && server.url === config.url && config.name === server.name) && <Icon name="check" size={size.icon.tiny} color={theme.primaryTouch} />}
							</Pressable>
						))
					}
					<Pressable
						style={({ pressed }) => ([mainStyles.opacity({ pressed }), settingStyles.optionItem(theme, true)])}
						delayLongPress={3000}
						onPress={() => { navigation.navigate('Settings/AddServer') }}
						// Add demo server for testing purposes
						onLongPress={() => {
							setSettings({
								...settings,
								servers: [
									...settings.servers,
									...demoServers.filter((server) => !settings.servers.some((s) => s.name === server.name))
								]
							})
						}}
					>
						<Icon name="plus" size={size.icon.tiny} color={theme.secondaryText} style={{ marginEnd: 10 }} />
						<Text numberOfLines={1} style={{ color: theme.primaryText, fontSize: size.text.medium, marginRight: 10, textTransform: 'uppercase', flex: 1, overflow: 'hidden' }}>
							Add server
						</Text>
					</Pressable>
				</View>
			</View>
			<ButtonText
				text="Disconnect"
				onPress={() => {
					upConfig({ url: null, username: null, query: null })
					setInfo(null)
					setError('')
				}} />
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

		</ScrollView>
	)
}

export default Connect;