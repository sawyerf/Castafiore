import React from 'react';
import { Text, View, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import { SongContext } from '~/contexts/song';
import { nextSong, pauseSong, resumeSong } from '~/utils/player';
import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import IconButton from '~/components/button/IconButton';
import ImageError from '~/components/ImageError';

const BoxPlayer = ({ fullscreen }) => {
	const [song, songDispatch] = React.useContext(SongContext)
	const config = React.useContext(ConfigContext)
	const insets = useSafeAreaInsets();
  const theme = React.useContext(ThemeContext)

	return (
		<Pressable
			onPress={() => fullscreen.set(true)}
			style={{
				position: 'absolute',
				bottom: (insets.bottom ? insets.bottom : 15) + 53,
				left: insets.left,
				right: insets.right,

				flexDirection: 'row',
				backgroundColor: theme.playerBackground,
				padding: 10,
				margin: 10,
				borderRadius: 10,
			}}>
			<View style={{ ...styles.boxPlayerImage, flex: Platform.OS === 'android' ? 0 : 'initial' }}>
				<ImageError
					source={{ uri: urlCover(config, song?.songInfo?.albumId, 100) }}
					style={styles.boxPlayerImage}
				>
					<View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
						<Icon name="music" size={23} color={theme.playerPrimaryText} />
					</View>
				</ImageError>
			</View>
			<View style={styles.boxPlayerText}>
				<Text style={{ color: theme.playerPrimaryText, flex: 1, fontWeight: 'bold' }} numberOfLines={1}>{song?.songInfo?.track ? `${song?.songInfo?.track}. ` : null}{song?.songInfo?.title ? song.songInfo.title : 'Song title'}</Text>
				<Text style={{ color: theme.playerSecondaryText, flex: 1 }} numberOfLines={1}>{song?.songInfo?.artist ? song.songInfo.artist : 'Artist'}</Text>
			</View>
			<View style={styles.boxPlayerButton}>
				<IconButton
					icon="step-forward"
					size={23}
					color={theme.playerButton}
					style={{ width: 35, alignItems: 'center' }}
					onPress={() => nextSong(config, song, songDispatch)}
				/>
				<IconButton
					icon={song.isPlaying ? 'pause' : 'play'}
					size={23}
					color={theme.playerButton}
					style={{ width: 35, alignItems: 'center' }}
					onPress={() => song.isPlaying ? pauseSong() : resumeSong()}
				/>
			</View>
		</Pressable>
	)
}

const styles = {
	boxPlayerImage: {
		height: 40,
		width: 40,
		marginRight: 10,
		borderRadius: 4,
	},
	boxPlayerText: {
		flex: 1,
	},
	boxPlayerButton: {
		flex: Platform.OS === 'android' ? 0 : 'initial',
		flexDirection: 'row',
	},
}

export default BoxPlayer;