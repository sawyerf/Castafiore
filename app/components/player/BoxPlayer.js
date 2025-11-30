import React from 'react'
import { Text, View, Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome'

import { ConfigContext } from '~/contexts/config'
import { SongContext, SongDispatchContext } from '~/contexts/song'
import { ThemeContext } from '~/contexts/theme'
import { urlCover } from '~/utils/url'
import { useUpnp } from '~/contexts/upnp'
import IconButton from '~/components/button/IconButton'
import ImageError from '~/components/ImageError'
import PlayButton from '~/components/button/PlayButton'
import Player from '~/utils/player'
import size from '~/styles/size'
import useKeyboardIsOpen from '~/utils/useKeyboardIsOpen'

const BoxPlayer = ({ setFullScreen }) => {
	const song = React.useContext(SongContext)
	const songDispatch = React.useContext(SongDispatchContext)
	const config = React.useContext(ConfigContext)
	const upnp = useUpnp()
	const insets = useSafeAreaInsets()
	const theme = React.useContext(ThemeContext)
	const isKeyboardOpen = useKeyboardIsOpen()

	// Force re-render when UPNP connection status changes
	// This ensures PlayButton uses the correct player (local vs UPNP)
	React.useEffect(() => {
		// This effect intentionally empty - just creates dependency on upnp.isConnected
	}, [upnp.isConnected])

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