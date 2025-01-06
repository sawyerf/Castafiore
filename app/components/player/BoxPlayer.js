import React from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import { SongContext, SongDispatchContext } from '~/contexts/song';
import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import PlayButton from '~/components/button/PlayButton';
import Player from '~/utils/player';
import IconButton from '~/components/button/IconButton';
import ImageError from '~/components/ImageError';
import size from '~/styles/size';

const BoxPlayer = ({ fullscreen }) => {
	const song = React.useContext(SongContext)
	const songDispatch = React.useContext(SongDispatchContext)
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
			<View style={styles.boxPlayerImage}>
				<ImageError
					source={{ uri: urlCover(config, song?.songInfo?.albumId, 100) }}
					style={styles.boxPlayerImage}
				>
					<View style={{ width: size.image.player, height: size.image.player, alignItems: 'center', justifyContent: 'center' }}>
						<Icon name="music" size={size.icon.small} color={theme.playerPrimaryText} />
					</View>
				</ImageError>
			</View>
			<View style={{ flex: 1 }}>
				<Text style={{ color: theme.playerPrimaryText, flex: 1, fontWeight: 'bold' }} numberOfLines={1}>{song?.songInfo?.track ? `${song?.songInfo?.track}. ` : null}{song?.songInfo?.title ? song.songInfo.title : 'Song title'}</Text>
				<Text style={{ color: theme.playerSecondaryText, flex: 1 }} numberOfLines={1}>{song?.songInfo?.artist ? song.songInfo.artist : 'Artist'}</Text>
			</View>
			<View style={{ flexDirection: 'row' }}>
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
			</View>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	boxPlayerImage: {
		height: size.image.player,
		width: size.image.player,
		marginRight: 10,
		borderRadius: 4,
	},
})

export default BoxPlayer;