import React from 'react';
import pkg from '~/../package.json';
import { Text, View, Image, ScrollView, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/contexts/config';
import { confirmAlert } from '~/utils/alert';
import { SetSettingsContext, defaultSettings, SettingsContext } from '~/contexts/settings';
import { SongDispatchContext } from '~/contexts/song';
import { ThemeContext } from '~/contexts/theme';
import ButtonMenu from '~/components/settings/ButtonMenu';
import ButtonSwitch from '~/components/settings/ButtonSwitch';
import mainStyles from '~/styles/main';
import Player from '~/utils/player';
import settingStyles from '~/styles/settings';
import size from '~/styles/size';

const Settings = ({ navigation }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const setSettings = React.useContext(SetSettingsContext)
	const setting = React.useContext(SettingsContext)
	const songDispatch = React.useContext(SongDispatchContext)

	return (
		<ScrollView
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={[
				mainStyles.contentMainContainer(insets),
				settingStyles.contentMainContainer
			]}
		>
			<View style={[settingStyles.optionsContainer(theme), { marginTop: 40 }]}>
				<Pressable
					onPress={() => Player.tuktuktuk(songDispatch)}
					style={({ pressed }) => ([mainStyles.opacity({ pressed }), {
						flexDirection: 'row',
						alignItems: 'center',
						width: '100%',
						paddingVertical: 10,
					}])}>
					<Image
						source={require('~/../assets/icon.png')}
						style={mainStyles.icon}
					/>
					<View style={{ flexDirection: 'column', justifyContent: 'center' }}>
						<Text style={{ color: theme.primaryText, fontSize: size.text.large, marginBottom: 0 }}>Castafiore</Text>
						<Text style={{ color: theme.secondaryText, fontSize: size.text.small }}>Version {pkg.version}</Text>
					</View>
				</Pressable>
			</View>
			<View style={settingStyles.optionsContainer(theme)}>
				<ButtonMenu
					title="Connect"
					endText={config.query ? (config.name?.length ? config.name : 'Connected') : 'Not connected'}
					icon="server"
					onPress={() => navigation.navigate('Connect')}
					isLast
				/>
			</View>

			<View style={settingStyles.optionsContainer(theme)}>
				<ButtonSwitch
					title="Desktop"
					icon="desktop"
					value={setting.isDesktop}
					onPress={() => setSettings({ ...setting, isDesktop: !setting.isDesktop })}
					isLast />
			</View>

			<View style={settingStyles.optionsContainer(theme)}>
				<ButtonMenu
					title="Home"
					icon="home"
					onPress={() => navigation.navigate('Settings/Home')}
				/>
				<ButtonMenu
					title="Playlists"
					icon="book"
					onPress={() => navigation.navigate('Settings/Playlists')}
				/>
				<ButtonMenu
					title="Player"
					icon="play"
					onPress={() => navigation.navigate('Settings/Player')}
				/>
				<ButtonMenu
					title="Theme"
					icon="tint"
					onPress={() => navigation.navigate('Settings/Theme')}
				/>
				<ButtonMenu
					title="Cache"
					icon="database"
					onPress={() => navigation.navigate('Settings/Cache')}
					isLast
				/>
			</View>

			{config.query && (
				<View style={settingStyles.optionsContainer(theme)}>
					<ButtonMenu
						title="Shares"
						icon="link"
						onPress={() => navigation.navigate('Settings/Shares')}
					/>
					<ButtonMenu
						title="Informations"
						icon="info"
						onPress={() => navigation.navigate('Settings/Informations')}
						isLast
					/>
				</View>
			)}

			<View style={settingStyles.optionsContainer(theme)}>
				<ButtonMenu
					title="Github"
					icon="github"
					onPress={() => Linking.openURL('https://github.com/sawyerf/Castafiore')}
					isLast
				/>
			</View>

			<View style={settingStyles.optionsContainer(theme)}>
				<ButtonMenu
					title="Reset Settings"
					icon="undo"
					onPress={() => {
						confirmAlert(
							'Reset Settings',
							'Are you sure you want to reset all settings?',
							() => setSettings({
								...defaultSettings,
								servers: setting.servers
							})
						)
					}}
					isLast
				/>
			</View>

		</ScrollView>
	)
}

export default Settings;