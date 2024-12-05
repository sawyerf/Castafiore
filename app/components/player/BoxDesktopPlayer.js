import React from 'react';
import { Text, View, Image, TouchableOpacity, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SongContext } from '~/contexts/song';
import { nextSong, pauseSong, resumeSong, previousSong, setPosition } from '~/utils/player';

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
	const [layoutBar, setLayoutBar] = React.useState({ width: 0, height: 0 })
	const [layoutBarTime, setLayoutBarTime] = React.useState({ width: 0, height: 0 })

	const secondToTime = (second) => {
		if (!second) return '00:00'
		return `${String((second - second % 60) / 60).padStart(2, '0')}:${String((second - second % 1) % 60).padStart(2, '0')}`
	}

	const setVolume = (vol) => {
		if (vol < 0) vol = 0
		if (vol > 1) vol = 1
		song.sound.volume = vol
	}

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
					<Pressable
						onPressIn={({ nativeEvent }) => setPosition(song.sound, (nativeEvent.locationX / layoutBarTime.width) * time.duration)}
						onPressOut={({ nativeEvent }) => setPosition(song.sound, (nativeEvent.locationX / layoutBarTime.width) * time.duration)}
						onLayout={({ nativeEvent }) => setLayoutBarTime({ width: nativeEvent.layout.width, height: nativeEvent.layout.height })}
					 style={{ flex: 1, height: 6 }} >
						<View style={{ width: '100%', height: '100%', borderRadius: 3, backgroundColor: theme.primaryLight, overflow: 'hidden' }} >
							<View style={{ width: `${(time.position / time.duration) * 100}%`, height: '100%', backgroundColor: theme.primaryTouch }} />
						</View>
					</Pressable>
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
				<Pressable
					style={{ maxWidth: 100, height: 25, paddingVertical: 10, width: '100%' }}
					onPressIn={({ nativeEvent }) => setVolume(nativeEvent.locationX / layoutBar.width)}
					onPressOut={({ nativeEvent }) => setVolume(nativeEvent.locationX / layoutBar.width)}
					onLayout={({ nativeEvent }) => setLayoutBar({ width: nativeEvent.layout.width, height: nativeEvent.layout.height })}
				>
					<View style={{ width: '100%', height: '100%', borderRadius: 3, backgroundColor: theme.primaryLight, overflow: 'hidden' }} >
						<View style={{ width: `${song.sound.volume * 100}%`, height: '100%', backgroundColor: theme.primaryTouch }} />
					</View>
					<View style={styles.bitognoBar(song.sound.volume, theme)} />
				</Pressable>
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
	boxPlayerText: {
	},
	boxPlayerButton: {
		flex: Platform.OS === 'android' ? 0 : 'initial',
		flexDirection: 'row',
	},
	bitognoBar: (vol, theme) => ({
		position: 'absolute',
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: theme.primaryTouch,
		left: `calc(${vol * 100}% - 6px)`, top: 7
	})
}

export default BoxDesktopPlayer;