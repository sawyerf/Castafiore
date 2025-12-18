
import React from 'react'
import { Text, View, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

import { ConfigContext } from '~/contexts/config'
import { SongDispatchContext } from '~/contexts/song'
import { ThemeContext } from '~/contexts/theme'
import { SettingsContext } from '~/contexts/settings'
import { useCachedAndApi } from '~/utils/api'
import { urlCover } from '~/utils/url'
import FavoritedButton from '~/components/button/FavoritedButton'
import mainStyles from '~/styles/main'
import CustomFlat from '~/components/lists/CustomFlat'
import ImageError from '~/components/ImageError'
import Player from '~/utils/player'
import size from '~/styles/size'

// TODO: made this component beautiful
const ItemPlaylist = ({ item }) => {
	const { t } = useTranslation()
	const theme = React.useContext(ThemeContext)
	const config = React.useContext(ConfigContext)
	const settings = React.useContext(SettingsContext)
	const navigation = useNavigation()
	const songDispatch = React.useContext(SongDispatchContext)

	const [songList] = useCachedAndApi([], 'getPlaylist', `id=${item.id}`, (json, setData) => {
		if (settings.reversePlaylist) setData(json?.playlist?.entry.reverse() || [])
		else setData(json?.playlist?.entry || [])
	}, [item.id, settings.reversePlaylist])

	return (
		<View style={{ width: 350, flexDirection: 'column', alignItems: 'start', padding: 10, borderRadius: 5, backgroundColor: theme.secondaryBack }}>
			<Pressable
				style={(pressed) => ([mainStyles.opacity(pressed), { flexDirection: 'row', alignItems: 'center', width: '100%' }])}
				onPress={() => navigation.navigate('Playlist', { playlist: item })}
			>
				<ImageError
					source={{ uri: urlCover(config, item) }}
					style={{ width: size.image.small, height: size.image.small, marginEnd: 10, borderRadius: 4 }}
				/>
				<View style={{ flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
					<Text numberOfLines={1} style={mainStyles.mediumText(theme.primaryText)}>
						{item.name}
					</Text>
					<Text numberOfLines={1} style={{ color: theme.secondaryText, fontSize: size.text.medium, width: '100%' }}>
						{(item.duration / 60) | 1} {t('min')} · {item.songCount} {t('songs')}
					</Text>
				</View>
			</Pressable>
			<View style={{ flexDirection: 'column', gap: 7, marginTop: 10, paddingStart: 10, width: '100%' }}>
				{
					songList.slice(0, 3).map((item, index) => (
						<Pressable
							key={index}
							style={(pressed) => ([mainStyles.opacity(pressed), {
								flexDirection: 'row',
								alignItems: 'center',
								width: '100%',
								paddingEnd: 10,
							}])}
							onPress={() => Player.playSong(config, songDispatch, songList, index)}
						>
							<ImageError
								source={{ uri: urlCover(config, item) }}
								style={{ width: size.image.tiny, height: size.image.tiny, marginEnd: 10, borderRadius: 4 }}
							/>
							<View style={{ flexDirection: 'column', flex: 1, marginEnd: 10 }}>
								<Text numberOfLines={1} style={mainStyles.smallText(theme.primaryText)}>
									{item.title}
								</Text>
								<Text numberOfLines={1} style={mainStyles.smallText(theme.secondaryText)}>
									{item.artist}
								</Text>
							</View>
							<FavoritedButton song={item} style={{ padding: 0 }} size={size.icon.tiny} />
						</Pressable>
					))
				}
			</View>
		</View>
	)
}

const HorizontalPlaylists = ({ playlists }) => {
	const config = React.useContext(ConfigContext)

	return (
		<CustomFlat
			data={playlists.filter((playlist) => playlist.comment?.includes(`#${config.username}-pin`))}
			renderItem={({ item }) => <ItemPlaylist item={item} />}
			widthItem={350 + 10}
		/>
	)
}

export default HorizontalPlaylists