import React from 'react'
import { Text, View, Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from '~/components/Icon'

import { useSong, useSongDispatch } from '~/contexts/song'
import { useConfig } from '~/contexts/config'
import { useTheme } from '~/contexts/theme'
import { urlCover } from '~/utils/url'
import PlayButton from '~/components/button/PlayButton'
import Player from '~/utils/player'
import IconButton from '~/components/button/IconButton'
import ImageError from '~/components/ImageError'
import size from '~/styles/size'
import useKeyboardIsOpen from '~/utils/useKeyboardIsOpen'

// Thin line along the bottom edge of the mini player. Own component so only it re-renders on each tick.
const Progress = () => {
	const song = useSong()
	const theme = useTheme()
	const time = Player.updateTime()
	const duration = time.duration > 0 && time.duration !== Infinity ? time.duration : song?.songInfo?.duration
	const ratio = duration ? Math.min(1, time.position / duration) : 0

	return (
		<View style={{ position: 'absolute', left: 10, right: 10, bottom: 0, height: 2, borderRadius: size.radius.sm, overflow: 'hidden' }}>
			<View style={{ width: `${ratio * 100}%`, height: '100%', backgroundColor: theme.playerButton }} />
		</View>
	)
}

const BoxPlayer = ({ setFullScreen }) => {
	const song = useSong()
	const songDispatch = useSongDispatch()
	const config = useConfig()
	const insets = useSafeAreaInsets()
	const theme = useTheme()
	const isKeyboardOpen = useKeyboardIsOpen()

	return (
		<Pressable
			onPress={() => setFullScreen(true)}
			style={{
				position: 'absolute',
				bottom: (insets.bottom ? insets.bottom : 10) + 59,
				left: insets.left,
				right: insets.right,

				flexDirection: 'row',
				alignItems: 'center',
				backgroundColor: theme.playerBackground,
				padding: 10,
				margin: 10,
				borderRadius: size.radius.lg,
				display: isKeyboardOpen ? 'none' : undefined,
			}}>
			<ImageError
				source={{ uri: urlCover(config, song?.songInfo, 100) }}
				style={styles.boxPlayerImage}
			>
				<View style={styles.boxPlayerImage}>
					<Icon name="music" size={size.icon.small} color={theme.playerPrimaryText} />
				</View>
			</ImageError>
			<View style={{ flex: 1 }}>
				<Text style={{ color: theme.playerPrimaryText, textAlign: 'left', flex: 1, fontWeight: 'bold' }} numberOfLines={1}>{song?.songInfo?.track ? `${song?.songInfo?.track}. ` : null}{song?.songInfo?.title ? song.songInfo.title : 'Song title'}</Text>
				<Text style={{ color: theme.playerSecondaryText, textAlign: 'left', flex: 1 }} numberOfLines={1}>{song?.songInfo?.artist ? song.songInfo.artist : 'Artist'}</Text>
			</View>
			<IconButton
				icon="step-forward"
				size={size.icon.small}
				color={theme.playerButton}
				style={{ width: 44, height: 44, alignItems: 'center' }}
				onPress={() => Player.nextSong(config, song, songDispatch)}
			/>
			<PlayButton
				size={size.icon.small}
				color={theme.playerButton}
				style={{ width: 44, height: 44, alignItems: 'center' }}
			/>
			<Progress />
		</Pressable>
	)
}

const styles = StyleSheet.create({
	boxPlayerImage: {
		height: size.image.player,
		width: size.image.player,
		marginRight: 10,
		borderRadius: size.radius.sm,
		alignItems: 'center',
		justifyContent: 'center',
	},
})

export default BoxPlayer