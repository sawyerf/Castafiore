import React from 'react';
import pkg from '~/../package.json';
import { Text, View, Image, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/contexts/config';
import { confirmAlert } from '~/utils/alert';
import { SetSettingsContext, defaultSettings, SettingsContext } from '~/contexts/settings';
import { SongDispatchContext } from '~/contexts/song';
import { ThemeContext } from '~/contexts/theme';
import Player from '~/utils/player';
import ButtonMenu from '~/components/settings/ButtonMenu';
import ButtonSwitch from '~/components/settings/ButtonSwitch';
import mainStyles from '~/styles/main';
import settingStyles from '~/styles/settings';

const Settings = ({ navigation }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const setSettings = React.useContext(SetSettingsContext)
	const setting = React.useContext(SettingsContext)
	const songDispatch = React.useContext(SongDispatchContext)

	return (
		<ScrollView
			style={mainStyles.mainContainer(insets, theme)}
			contentContainerStyle={[
				mainStyles.contentMainContainer(insets),
				settingStyles.contentMainContainer
			]}
		>
			<View style={[settingStyles.optionsContainer(theme), { marginTop: 40 }]}>
				<Pressable
					onPress={() => Player.tuktuktuk(songDispatch)}
					style={({ pressed }) => ({
						flexDirection: 'row',
						alignItems: 'center',
						width: '100%',
						paddingVertical: 10,
						opacity: pressed ? 0.5 : 1,
					})}>
					<Image
						source={require('~/../assets/icon.png')}
						style={{ width: 50, height: 50, borderRadius: 10, marginEnd: 10 }}
					/>
					<View style={{ flexDirection: 'column', justifyContent: 'center' }}>
						<Text style={{ color: theme.primaryLight, fontSize: 20, marginBottom: 0 }}>Castafiore</Text>
						<Text style={{ color: theme.secondaryLight, fontSize: 13 }}>Version {pkg.version}</Text>
					</View>
				</Pressable>
			</View>
			<View style={settingStyles.optionsContainer(theme)}>
				<ButtonMenu
					title="Connect"
					endText={config.query ? (config.name?.length ? config.name : 'Connected') : 'Not connected'}
					icon="server"
					onPress={() => navigation.navigate('Connect')}
					isLast={true}
				/>
			</View>

			<View style={settingStyles.optionsContainer(theme)}>
				<ButtonSwitch
					title="Desktop"
					icon="desktop"
					value={setting.isDesktop}
					onPress={() => setSettings({ ...setting, isDesktop: !setting.isDesktop })}
					isLast={true} />
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
					title="Theme"
					icon="tint"
					onPress={() => navigation.navigate('Settings/Theme')}
				/>
				<ButtonMenu
					title="Cache"
					icon="database"
					onPress={() => navigation.navigate('Settings/Cache')}
					isLast={true}
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
							() => setSettings(defaultSettings)
						)
					}}
					isLast={true}
				/>
			</View>
		</ScrollView>
	)
}

export default Settings;