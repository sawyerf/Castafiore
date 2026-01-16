import React from 'react'
import { Pressable, Text, View, StyleSheet, Platform } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { useConfig } from '~/contexts/config'
import { useSong, useSongDispatch } from '~/contexts/song'
import { useTheme } from '~/contexts/theme'
import { urlCover } from '~/utils/url'
import { useCachedFirst } from '~/utils/api'
import Player from '~/utils/player'
import IconButton from '~/components/button/IconButton'
import ImageError from '~/components/ImageError'
import SlideBar from '~/components/button/SlideBar'
import FavoritedButton from '~/components/button/FavoritedButton'
import size from '~/styles/size'
import PlayButton from '~/components/button/PlayButton'

const BoxDesktopPlayer = ({ setFullScreen }) => {
	const song = useSong()
	const songDispatch = useSongDispatch()
	const config = useConfig()
	const theme = useTheme()
	const time = Player.updateTime()
	const volume = Player.updateVolume()
	const [fakeTime, setFakeTime] = React.useState(-1)

	const [stars] = useCachedFirst([], 'getStarred2', null, (json, setData) => {
		setData(json?.starred2?.song || [])
	}, [song.songInfo?.id])

	return (
		<View
			style={styles.container(theme)}>
			<Pressable
				onPress={() => setFullScreen(true)}
				style={{ flexDirection: 'row', flex: 1 }}
			>
				<ImageError
					source={{ uri: urlCover(config, song?.songInfo, 100) }}
					style={styles.boxPlayerImage}
				>
					<View style={styles.boxPlayerImage}>
						<Icon name="music" size={size.icon.small} color={theme.primaryText} />
					</View>
				</ImageError>
				<View style={{ justifyContent: 'center', gap: 2, flex: Platform.select({ web: 1, default: 0 }), maxWidth: 'min-content' }}>
					<Text numberOfLines={1} style={{ color: theme.primaryText, textAlign: 'left', fontWeight: 'bold', maxWidth: 400 }}>{song?.songInfo?.track ? `${song?.songInfo?.track}. ` : null}{song?.songInfo?.title ? song.songInfo.title : 'Song title'}</Text>
					<Text numberOfLines={1} style={{ color: theme.secondaryText, textAlign: 'left', maxWidth: 400 }}>{song?.songInfo?.artist ? song.songInfo.artist : 'Artist'}</Text>
				</View>
				<FavoritedButton
					id={song?.songInfo?.id}
					isFavorited={stars.some(s => s.id === song.songInfo.id)}
					rating={song.songInfo?.userRating ?? song.songInfo?.rating ?? 0}
					size={19}
					style={{ marginHorizontal: 15, padding: 5 }}
				/>
			</Pressable>
			<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 7 }}>
				<View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
					<IconButton
						icon="repeat"
						style={{ width: 22, alignItems: 'end' }}
						size={17}
						color={song.actionEndOfSong == 'repeat' ? theme.primaryTouch : theme.secondaryText}
						onPress={() => {
							Player.setRepeat(songDispatch, song.actionEndOfSong === 'repeat' ? 'next' : 'repeat')
						}}
					/>
					<IconButton
						icon="step-backward"
						style={{ width: 12, alignItems: 'end' }}
						size={17.5}
						color={theme.primaryText}
						onPress={() => Player.previousSong(config, song, songDispatch)}
					/>
					<PlayButton
						style={{ width: 22, alignItems: 'center' }}
						size={19}
						color={theme.primaryText}
					/>
					<IconButton
						icon="step-forward"
						style={{ width: 12, alignItems: 'start' }}
						size={17.5}
						color={theme.primaryText}
						onPress={() => Player.nextSong(config, song, songDispatch)}
					/>
					<IconButton
						icon="random"
						size={17}
						style={{ width: 22, alignItems: 'start', justifyContent: 'center' }}
						color={song.actionEndOfSong == 'random' ? theme.primaryTouch : theme.secondaryText}
						onPress={() => Player.setRepeat(songDispatch, song.actionEndOfSong === 'random' ? 'next' : 'random')}
					/>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, maxWidth: '100%' }}>
					<Text style={{ color: theme.primaryText, fontSize: size.text.small }}>{Player.secondToTime(fakeTime < 0 ? time.position : fakeTime * time.duration)}</Text>
					<SlideBar
						progress={fakeTime < 0 ? time.position / time.duration : fakeTime}
						onStart={(progress) => Player.pauseSong() && setFakeTime(progress)}
						onChange={(progress) => setFakeTime(progress)}
						onComplete={(progress) => Player.setPosition(progress * time.duration) && Player.resumeSong() && setTimeout(() => setFakeTime(-1), 500)}
						stylePress={{ flex: 1, height: 6 }}
						styleBar={{ width: '100%', height: '100%', borderRadius: 3, overflow: 'hidden' }}
						styleProgress={{ backgroundColor: theme.primaryTouch }}
					/>
					<Text style={{ color: theme.primaryText, fontSize: size.text.small }}>{Player.secondToTime(time.duration)}</Text>
				</View>
			</View>
			<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginEnd: 20, gap: 5 }}>

				{
					Player.isVolumeSupported() && (
						<>
							<IconButton
								icon={volume ? "volume-up" : "volume-off"}
								size={17}
								color={theme.primaryText}
								style={{ width: 27 }}
								onPress={() => Player.setVolume(volume ? 0 : 1)}
							/>
							<SlideBar
								progress={volume}
								onStart={(progress) => Player.setVolume(progress)}
								onChange={(progress) => Player.setVolume(progress)}
								stylePress={{ maxWidth: 100, height: 25, paddingVertical: 10, width: '100%' }}
								styleBar={{ width: '100%', height: '100%', borderRadius: 3, overflow: 'hidden' }}
								styleProgress={{ backgroundColor: theme.primaryTouch }}
								isBitogno={true}
							/>
						</>
					)
				}
				<IconButton
					icon="expand"
					size={17}
					style={{ padding: 5, paddingHorizontal: 8, marginStart: 15, borderRadius: 4 }}
					color={theme.primaryText}
					onPress={() => setFullScreen(true)}
				/>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: theme => ({
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		width: '100vw',
		flexDirection: 'row',
		backgroundColor: theme.secondaryBack,
		padding: 10,
		paddingLeft: 15,
		borderTopWidth: 1,
		borderTopColor: theme.tertiaryBack,
	}),
	boxPlayerImage: {
		height: 56,
		width: 56,
		marginRight: 10,
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
})

export default BoxDesktopPlayer