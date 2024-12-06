import React from 'react';
import { Text, View, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext } from '~/contexts/config';
import { SongContext } from '~/contexts/song';
import { ThemeContext } from '~/contexts/theme';
import { nextSong, pauseSong, resumeSong, previousSong, setPosition, secondToTime, setVolume } from '~/utils/player';
import { urlCover } from '~/utils/api';
import mainStyles from '~/styles/main';
import IconButton from '~/components/button/IconButton';
import ImageError from '~/components/ImageError';
import SlideBar from '~/components/button/SlideBar';

const BoxDesktopPlayer = ({ fullscreen, time }) => {
	const [song, songDispatch] = React.useContext(SongContext)
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)

	return (
		<View
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
				borderTopColor: theme.tertiaryDark,
			}}>
			<View style={{ flexDirection: 'row', flex: 1 }}>
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
				<View style={{ flex: 1, justifyContent: 'center', gap: 2 }}>
					<Text style={{ color: theme.playerPrimaryText, fontWeight: 'bold' }} numberOfLines={1}>{song?.songInfo?.track ? `${song?.songInfo?.track}. ` : null}{song?.songInfo?.title ? song.songInfo.title : 'Song title'}</Text>
					<Text style={{ color: theme.playerSecondaryText, }} numberOfLines={1}>{song?.songInfo?.artist ? song.songInfo.artist : 'Artist'}</Text>
				</View>
			</View>
			<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 7 }}>
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
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, maxWidth: '100%' }}>
					<Text style={{ color: theme.primaryLight, fontSize: 13 }}>{secondToTime(time.position)}</Text>
					<SlideBar
						progress={time.position / time.duration}
						onPress={(progress) => setPosition(song.sound, progress * time.duration)}
						stylePress={{ flex: 1, height: 6 }}
						styleBar={{ width: '100%', height: '100%', borderRadius: 3, backgroundColor: theme.primaryLight, overflow: 'hidden' }}
						styleProgress={{ backgroundColor: theme.primaryTouch }}
					/>
					<Text style={{ color: theme.primaryLight, fontSize: 13 }}>{secondToTime(time.duration)}</Text>
				</View>
			</View>
			<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginEnd: 20, gap: 5 }} >
				{
					song?.sound?.volume ?
						<IconButton
							icon="volume-up"
							size={17}
							color={theme.primaryLight}
							style={{ width: 27 }}
							onPress={() => song.sound.volume = 0}
						/>
						: <IconButton
							icon="volume-off"
							size={17}
							style={{ width: 27 }}
							color={theme.primaryLight}
							onPress={() => song.sound.volume = 1}
						/>
				}
				<SlideBar
					progress={song.sound.volume}
					onPress={(progress) => setVolume(song.sound ,progress)}
					stylePress={{ maxWidth: 100, height: 25, paddingVertical: 10, width: '100%' }}
					styleBar={{ width: '100%', height: '100%', borderRadius: 3, backgroundColor: theme.primaryLight, overflow: 'hidden' }}
					styleProgress={{ backgroundColor: theme.primaryTouch }}
					isBitogno={true}
				/>
				<IconButton
					icon="expand"
					size={17}
					style={{ padding: 5, paddingHorizontal: 8, marginStart: 15, borderRadius: 4 }}
					color={theme.primaryLight}
					onPress={() => fullscreen.set(true)}
				/>
			</View>
		</View>
	)
}

const styles = {
	boxPlayerImage: {
		height: 56,
		width: 56,
		marginRight: 10,
		borderRadius: 4,
	},
}

export default BoxDesktopPlayer;