import React from 'react'
import { Text, View, Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome'

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
				backgroundColor: theme.playerBackground,
				padding: 10,
				margin: 10,
				borderRadius: 10,
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
				style={{ width: 35, alignItems: 'center' }}
				onPress={() => Player.nextSong(config, song, songDispatch)}
			/>
			<PlayButton
				size={size.icon.small}
				color={theme.playerButton}
				style={{ width: 35, alignItems: 'center' }}
			/>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	boxPlayerImage: {
		height: size.image.player,
		width: size.image.player,
		marginRight: 10,
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
})

export default BoxPlayer