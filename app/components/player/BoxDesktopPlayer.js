import React from 'react';
import { Text, View, Image, TouchableOpacity, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SongContext } from '~/contexts/song';
import { nextSong, pauseSong, resumeSong } from '~/utils/player';

import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import mainStyles from '~/styles/main';
import { urlCover } from '~/utils/api';
import IconButton from '~/components/button/IconButton';
import ImageError from '~/components/ImageError';

const BoxDesktopPlayer = ({ fullscreen, time }) => {
	const [song, songDispatch] = React.useContext(SongContext)
	const config = React.useContext(ConfigContext)
	const insets = useSafeAreaInsets();
	const theme = React.useContext(ThemeContext)

	const secondToTime = (second) => {
		return `${String((second - second % 60) / 60).padStart(2, '0')}:${String((second - second % 1) % 60).padStart(2, '0')}`
	}

	return (
		<TouchableOpacity
			onPress={() => fullscreen.set(true)}
			activeOpacity={1}
			style={{
				position: 'absolute',
				bottom: 0,
				left: 0,
				right: 0,
				width: '100vw',

				flexDirection: 'row',
				backgroundColor: theme.playerBackground,
				padding: 10,
				paddingLeft: 15,
				borderTopWidth: 1,
				borderTopColor: theme.secondaryLight,
				// margin: 10,
				// borderRadius: 10,
			}}>
			<View style={{ ...styles.boxPlayerImage, flex: Platform.OS === 'android' ? 0 : 'initial' }}>
				<ImageError
					source={{ uri: urlCover(config, song?.songInfo?.albumId, 100), }}
					style={styles.boxPlayerImage}
				>
					<View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
						<Icon name="music" size={23} color={theme.playerPrimaryText} />
					</View>
				</ImageError>
			</View>
			<View style={{ flex: 1, justifyContent: 'center', gap: 4 }}>
				<Text style={{ color: theme.playerPrimaryText, fontWeight: 'bold' }} numberOfLines={1}>{song?.songInfo?.track ? `${song?.songInfo?.track}. ` : null}{song?.songInfo?.title ? song.songInfo.title : 'Song title'}</Text>
				<Text style={{ color: theme.playerSecondaryText, }} numberOfLines={1}>{song?.songInfo?.artist ? song.songInfo.artist : 'Artist'}</Text>
			</View>
			<View style={{ flex: 2, flexDirection: 'column', justifyContent: 'center', gap: 7 }}>
				<View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20 }}>
					<IconButton
						icon="repeat"
						size={19}
						color={song.actionEndOfSong == 'repeat' ? theme.primaryTouch : theme.secondaryLight}
						onPress={() => {
							songDispatch({ type: 'setActionEndOfSong', action: song.actionEndOfSong === 'repeat' ? 'next' : 'repeat' })
						}}
					/>
					<IconButton
						icon="step-backward"
						size={19}
						color={theme.primaryLight}
						onPress={() => previousSong(config, song, songDispatch)}
					/>
					<IconButton
						icon={song.isPlaying ? 'pause' : 'play'}
						size={19}
						color={theme.primaryLight}
						onPress={() => song.isPlaying ? pauseSong(song.sound) : resumeSong(song.sound)}
					/>
					<IconButton
						icon="step-forward"
						size={19}
						color={theme.primaryLight}
						onPress={() => nextSong(config, song, songDispatch)}
					/>
					<IconButton
						icon="bars"
						size={19}
						color={song.actionEndOfSong == 'repeat' ? theme.primaryTouch : theme.secondaryLight}
					/>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
					<Text style={{ color: theme.primaryLight, fontSize: 13 }}>{secondToTime(time.position)}</Text>
					<View style={{ width: '100%', height: 6 }} >
						<View style={{ width: '100%', height: '100%', borderRadius: 3, backgroundColor: theme.primaryLight, overflow: 'hidden' }} >
							<View style={{ width: `${(time.position / time.duration) * 100}%`, height: '100%', backgroundColor: theme.primaryTouch }} />
						</View>
					</View>
					<Text style={{ color: theme.primaryLight, fontSize: 13 }}>{secondToTime(time.duration)}</Text>
				</View>
			</View>
			<View style={{ flex: 1 }}> </View>
		</TouchableOpacity>
	)
}

const styles = {
	boxPlayerImage: {
		height: 56,
		width: 56,
		marginRight: 10,
		borderRadius: 4,
	},
	boxPlayerText: {
	},
	boxPlayerButton: {
		flex: Platform.OS === 'android' ? 0 : 'initial',
		flexDirection: 'row',
	},
}

export default BoxDesktopPlayer;