import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome';

import { SettingsContext, SetSettingsContext } from '~/contexts/settings'
import { ThemeContext } from '~/contexts/theme'
import Header from '~/components/Header'
import mainStyles from '~/styles/main'
import OptionInput from '~/components/settings/OptionInput'
import settingStyles from '~/styles/settings'
import SelectItem from '~/components/settings/SelectItem';

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
		if (number === settings.previewFavorited) return
		setSettings({ ...settings, previewFavorited: number })
	}, [previewFavorited])

	return (
		<View
			style={{
				...mainStyles.mainContainer(insets, theme),
				...mainStyles.contentMainContainer(insets)
			}}
		>
			<Header title="Playlists" />
			<View style={{ ...settingStyles.contentMainContainer(insets), marginTop: 30 }}>
				<Text style={settingStyles.titleContainer(theme)}>Preview Favorited</Text >
				<View style={{ ...settingStyles.optionsContainer(theme), marginBottom: 5 }}>
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
				<Text style={settingStyles.description(theme)}>Number of songs to preview in favorited playlist (default: 3)</Text >

				<Text style={settingStyles.titleContainer(theme)}>Order Playlists</Text >
				<View style={settingStyles.optionsContainer(theme)}>
					{
						Object.keys(orders).map((name, index) => (
							<SelectItem
								key={index}
								text={orders[name].name}
								icon={orders[name].icon}
								isSelect={name == settings.orderPlaylist}
								onPress={() => {
									setSettings({ ...settings, orderPlaylist: name })
								}}
							/>
						))
					}
				</View>
			</View>
		</View >
	)
}

export default CacheSettings;