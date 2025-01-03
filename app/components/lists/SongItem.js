import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { getCache } from '~/utils/cache';
import { playSong } from '~/utils/player';
import { SettingsContext } from '~/contexts/settings';
import { SongContext } from '~/contexts/song';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import { urlStream } from '~/utils/api';
import FavoritedButton from '~/components/button/FavoritedButton';

const Cached = ({ song, config }) => {
	const [isCached, setIsCached] = React.useState(false)
	const theme = React.useContext(ThemeContext)
	const settings = React.useContext(SettingsContext)

	React.useEffect(() => {
		cached(song)
			.then((res) => {
				setIsCached(res)
			})
	}, [song.id, settings.showCache])

	const cached = async (song) => {
		if (!settings.showCache) return false
		const cache = await getCache('song', urlStream(config, song.id))
		if (cache) return true
		return false
	}

	if (isCached) return (
		<Icon
			name="cloud-download"
			size={14}
			color={theme.secondaryLight}
			style={{ paddingHorizontal: 5 }}
		/>
	)
	return null
}

const SongItem = ({ config, song, queue, index, isIndex = false, isPlaying = false, setIndexOptions = () => { }, onPress = () => {} }) => {
	const [songCon, songDispatch] = React.useContext(SongContext)
	const theme = React.useContext(ThemeContext)

	return (
		<TouchableOpacity
			style={styles.song}
			key={song.id}
			onLongPress={() => setIndexOptions(index)}
			onContextMenu={() => setIndexOptions(index)}
			delayLongPress={200}
			onPress={() => {
				onPress(song)
				playSong(config, songDispatch, queue, index)
			}}>
			<Image
				style={styles.albumCover}
				source={{
					uri: urlCover(config, song.albumId, 100),
				}}
			/>
			<View style={{ flex: 1, flexDirection: 'column' }}>
				<Text numberOfLines={1} style={{ color: isPlaying ? theme.primaryTouch : theme.primaryLight, fontSize: 16, marginBottom: 2 }}>
					{(isIndex && song.track !== undefined) ? `${song.track}. ` : null}{song.title}
				</Text>
				<Text numberOfLines={1} style={{ color: isPlaying ? theme.secondaryTouch : theme.secondaryLight }}>
					{song.artist}
				</Text>
			</View>
			<Cached song={song} config={config} />
			<FavoritedButton id={song.id} isFavorited={song?.starred} config={config} style={{ padding: 5, paddingStart: 10 }} />
		</TouchableOpacity>
	)
}

const styles = {
	song: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	albumCover: {
		height: 50,
		width: 50,
		marginRight: 10,
		borderRadius: 4,
	},
}

export default SongItem;