import React from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext } from '~/contexts/config';
import { isSongCached } from '~/utils/cache';
import { playSong } from '~/utils/player';
import { SettingsContext } from '~/contexts/settings';
import { SongDispatchContext } from '~/contexts/song';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
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
		const cache = await isSongCached(config, song.id, settings.streamFormat, settings.maxBitrate)
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

const SongItem = ({ song, queue, index, isIndex = false, isPlaying = false, setIndexOptions = () => { }, onPress = () => true, style = {} }) => {
	const songDispatch = React.useContext(SongDispatchContext)
	const theme = React.useContext(ThemeContext)
	const config = React.useContext(ConfigContext)
	const settings = React.useContext(SettingsContext)
	const [isHover, setIsHover] = React.useState(false)

	return (
		<Pressable
			style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.song, style, { backgroundColor: isHover ? theme.secondaryBack : 'transparent' }])}
			onHoverIn={() => { settings.isDesktop && setIsHover(true) }}
			onHoverOut={() => { settings.isDesktop && setIsHover(false) }}
			onPress={() => {
				if (onPress(song, queue, index)) playSong(config, songDispatch, queue, index)
			}}
			delayLongPress={200}
			onLongPress={() => setIndexOptions(index)}
			onContextMenu={(ev) => {
				ev.preventDefault()
				return setIndexOptions(index)
			}}
		>
			<View style={[mainStyles.coverSmall(theme), { overflow: 'hidden', marginRight: 10 }]}>
				{isPlaying && (
					<View style={{
						position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1,
						backgroundColor: 'rgba(0, 0, 0, 0.3)',
						justifyContent: 'center', alignItems: 'center'
					}}
					>
						<Icon name="align-center" size={19} color={'white'} style={{ height: 19, transform: [{ rotate: '90deg' }] }} />
					</View>
				)}
				<ImageError
					style={[mainStyles.coverSmall(theme)]}
					source={{ uri: urlCover(config, song, 100) }}
				/>
			</View>
			<View style={{ flex: 1, flexDirection: 'column' }}>
				<Text numberOfLines={1} style={[mainStyles.mediumText(isPlaying ? theme.primaryTouch : theme.primaryText), { marginBottom: 2 }]}>
					{(isIndex && song.track !== undefined) ? `${song.track}. ` : null}{song.title}
				</Text>
				<Text numberOfLines={1} style={mainStyles.smallText(theme.secondaryText)}>
					{song.artist}
				</Text>
			</View>
			{
				settings.isDesktop ? (
					<Text style={[mainStyles.smallText(theme.secondaryText), { marginHorizontal: 10 }]}>
						{song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '0:00'}
					</Text>
				) : null}
			<Cached song={song} />
			<FavoritedButton id={song.id} isFavorited={song?.starred} style={{ padding: 5, paddingStart: 10 }} />
		</Pressable>
	)
}

const styles = StyleSheet.create({
	song: {
		flexDirection: 'row',
		alignItems: 'center',
		height: size.image.small,
		marginBottom: 10,
		borderRadius: 4,
	},
})

export default SongItem;