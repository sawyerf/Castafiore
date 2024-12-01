import React from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome';

import { SettingsContext, SetSettingsContext } from '~/contexts/settings'
import presStyles from '~/styles/pres'
import mainStyles from '~/styles/main'
import settingStyles from '~/styles/settings'
import Header from '~/components/Header'
import OptionInput from '~/components/settings/OptionInput'
import { ThemeContext } from '~/contexts/theme'

const CacheSettings = () => {
	const insets = useSafeAreaInsets()
	const settings = React.useContext(SettingsContext)
	const setSettings = React.useContext(SetSettingsContext)
	const theme = React.useContext(ThemeContext)
	const [previewFavorited, setPreviewFavorited] = React.useState(settings.previewFavorited.toString())
	const orders = {
		'title': {
			name: 'Title',
			icon: 'sort-alpha-asc',
		},
		'changed': {
			name: 'Recently Updated',
			icon: 'sort-amount-desc',
		},
		'newest': {
			name: 'Newest First',
			icon: 'sort-numeric-desc',
		},
		'oldest': {
			name: 'Oldest First',
			icon: 'sort-numeric-asc',
		},
	}

	React.useEffect(() => {
		if (settings.previewFavorited.toString() != previewFavorited)
			setPreviewFavorited(settings.previewFavorited.toString())
	}, [settings.previewFavorited])

	React.useEffect(() => {
		if (previewFavorited === '') return
		const number = parseInt(previewFavorited)
		setSettings({ ...settings, previewFavorited: number })
	}, [previewFavorited])

	return (
		<View style={{ ...mainStyles.mainContainer(insets, theme), flexDirection: 'column', alignItems: 'center', width: '100%' }}>
			<Header title="Cache" />
			<View style={{ ...settingStyles.contentMainContainer(insets), marginTop: 30 }}>
				<Text style={settingStyles.titleContainer(theme)}>Preview Favorited</Text >
				<View style={{ ...settingStyles.optionsContainer(theme), marginBottom: 5}}>
					<OptionInput
						title="Song preview favorited"
						value={previewFavorited}
						onChangeText={(text) => {
							if (parseInt(text) > 9) return
							setPreviewFavorited(text.replace(/[^0-9]/g, ''))
						}}
						inputMode="numeric"
						isLast={true}
					/>
				</View>
				<Text style={{...settingStyles.description(theme), marginBottom: 20}}>Number of songs to preview in favorited playlist (default: 3)</Text >

				<Text style={settingStyles.titleContainer(theme)}>Order Playlists</Text >
				<View style={settingStyles.optionsContainer(theme)}>
					{
						Object.keys(orders).map((name, index) => (
							<TouchableOpacity style={settingStyles.optionItem(theme, true)} key={index}
								delayLongPress={200}
								onLongPress={null}
								onPress={() => {
									setSettings({ ...settings, orderPlaylist: name })
								}}>
								<Icon name={orders[name].icon} size={16} color={theme.primaryLight} style={{ marginEnd: 10 }} />
								<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: 16, marginRight: 10, textTransform: 'uppercase', flex: 1, overflow: 'hidden' }}>
									{orders[name].name}
								</Text>
								{(name == settings.orderPlaylist) && <Icon name="check" size={20} color={theme.primaryTouch} />}
							</TouchableOpacity>
						))
					}
				</View>
			</View>
		</View>
	)
}

export default CacheSettings;