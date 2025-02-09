import React from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext } from '~/contexts/config';
import { getCache } from '~/utils/cache';
import { playSong } from '~/utils/player';
import { SettingsContext } from '~/contexts/settings';
import { SongDispatchContext } from '~/contexts/song';
import { ThemeContext } from '~/contexts/theme';
import { urlCover, urlStream } from '~/utils/api';
import FavoritedButton from '~/components/button/FavoritedButton';
import ImageError from '~/components/ImageError';
import mainStyles from '~/styles/main';
import size from '~/styles/size';

const Cached = ({ song }) => {
	const [isCached, setIsCached] = React.useState(false)
	const theme = React.useContext(ThemeContext)
	const settings = React.useContext(SettingsContext)
	const config = React.useContext(ConfigContext)

	React.useEffect(() => {
		cached(song)
			.then((res) => {
				setIsCached(res)
			})
	}, [song.id, settings.showCache])

	const cached = async (song) => {
		if (!settings.showCache) return false
		const cache = await getCache('song', urlStream(config, song.id, settings.streamFormat, settings.maxBitrate))
		if (cache) return true
		return false
	}

	if (isCached) return (
		<Icon
			name="cloud-download"
			size={14}
			color={theme.secondaryText}
			style={{ paddingHorizontal: 5 }}
		/>
	)
	return null
}

const SongItem = ({ song, queue, index, isIndex = false, isPlaying = false, setIndexOptions = () => { }, onPress = () => { } }) => {
	const songDispatch = React.useContext(SongDispatchContext)
	const theme = React.useContext(ThemeContext)
	const config = React.useContext(ConfigContext)

	return (
		<Pressable
			style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.song])}
			key={song.id}
			onLongPress={() => setIndexOptions(index)}
			onContextMenu={() => setIndexOptions(index)}
			delayLongPress={200}
			onPress={() => {
				onPress(song)
				playSong(config, songDispatch, queue, index)
			}}>
			<ImageError
				style={[mainStyles.coverSmall(theme), { marginRight: 10 }]}
				source={{
					uri: urlCover(config, song.albumId, 100),
				}}
			/>
			<View style={{ flex: 1, flexDirection: 'column' }}>
				<Text numberOfLines={1} style={{ color: isPlaying ? theme.primaryTouch : theme.primaryText, fontSize: size.text.medium, marginBottom: 2 }}>
					{(isIndex && song.track !== undefined) ? `${song.track}. ` : null}{song.title}
				</Text>
				<Text numberOfLines={1} style={{ color: isPlaying ? theme.secondaryTouch : theme.secondaryText, fontSize: size.text.small }}>
					{song.artist}
				</Text>
			</View>
			<Cached song={song} />
			<FavoritedButton id={song.id} isFavorited={song?.starred} style={{ padding: 5, paddingStart: 10 }} />
		</Pressable>
	)
}

const styles = StyleSheet.create({
	song: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
})

export default SongItem;