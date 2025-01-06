import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext } from '~/contexts/config';
import { SongContext, SongDispatchContext } from '~/contexts/song';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import Player from '~/utils/player';
import IconButton from '~/components/button/IconButton';
import ImageError from '~/components/ImageError';
import SlideBar from '~/components/button/SlideBar';
import FavoritedButton from '~/components/button/FavoritedButton';
import size from '~/styles/size';

const BoxDesktopPlayer = ({ fullscreen }) => {
	const song = React.useContext(SongContext)
	const songDispatch = React.useContext(SongDispatchContext)
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const time = Player.updateTime()
	const volume = Player.updateVolume()
	const [fakeTime, setFakeTime] = React.useState(-1)

	return (
		<View
			style={{
				position: 'absolute',
				bottom: 0,
				left: 0,
				right: 0,
				width: '100vw',

				flexDirection: 'row',
				backgroundColor: theme.secondaryDark,
				padding: 10,
				paddingLeft: 15,
				borderTopWidth: 1,
				borderTopColor: theme.tertiaryDark,
			}}>
			<Pressable
				onPress={() => fullscreen.set(true)}
				style={{ flexDirection: 'row', flex: 1 }}
			>
				<ImageError
					source={{ uri: urlCover(config, song?.songInfo?.albumId, 100), }}
					style={styles.boxPlayerImage}
				>
					<View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
						<Icon name="music" size={size.icon.small} color={theme.primaryLight} />
					</View>
				</ImageError>
				<View style={{ justifyContent: 'center', gap: 2, flex: 'min-content', maxWidth: 'min-content' }}>
					<Text style={{ color: theme.primaryLight, fontWeight: 'bold', maxWidth: 400 }} numberOfLines={1}>{song?.songInfo?.track ? `${song?.songInfo?.track}. ` : null}{song?.songInfo?.title ? song.songInfo.title : 'Song title'}</Text>
					<Text style={{ color: theme.secondaryLight, maxWidth: 400 }} numberOfLines={1}>{song?.songInfo?.artist ? song.songInfo.artist : 'Artist'}</Text>
				</View>
				<FavoritedButton
					id={song?.songInfo?.id}
					isFavorited={song?.songInfo?.starred}
					size={19}
					style={{ marginHorizontal: 15, padding: 5 }}
				/>
			</Pressable>
			<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 7 }}>
				<View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
					<IconButton
						icon="repeat"
						style={{ width: 22, alignItems: 'end' }}
						size={19}
						color={song.actionEndOfSong == 'repeat' ? theme.primaryTouch : theme.secondaryLight}
						onPress={() => {
							Player.setRepeat(songDispatch, song.actionEndOfSong === 'repeat' ? 'next' : 'repeat')
						}}
					/>
					<IconButton
						icon="step-backward"
						style={{ width: 10, alignItems: 'end' }}
						size={17}
						color={theme.primaryLight}
						onPress={() => Player.previousSong(config, song, songDispatch)}
					/>
					<IconButton
						icon={song.isPlaying ? 'pause' : 'play'}
						style={{ width: 20, alignItems: 'center' }}
						size={19}
						color={theme.primaryLight}
						onPress={() => song.isPlaying ? Player.pauseSong() : Player.resumeSong()}
					/>
					<IconButton
						icon="step-forward"
						style={{ width: 10, alignItems: 'start' }}
						size={17}
						color={theme.primaryLight}
						onPress={() => Player.nextSong(config, song, songDispatch)}
					/>
					<IconButton
						icon="bars"
						size={19}
						style={{ width: 22, alignItems: 'start' }}
						color={theme.secondaryLight}
					/>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, maxWidth: '100%' }}>
					<Text style={{ color: theme.primaryLight, fontSize: size.text.small }}>{Player.secondToTime(fakeTime < 0 ? time.position : fakeTime * time.duration)}</Text>
					<SlideBar
						progress={fakeTime < 0 ? time.position / time.duration : fakeTime}
						onStart={(progress) => Player.pauseSong() && setFakeTime(progress)}
						onChange={(progress) => setFakeTime(progress)}
						onComplete={() => Player.setPosition(fakeTime * time.duration) && Player.resumeSong() && setFakeTime(-1)}
						stylePress={{ flex: 1, height: 6 }}
						styleBar={{ width: '100%', height: '100%', borderRadius: 3, backgroundColor: theme.primaryLight, overflow: 'hidden' }}
						styleProgress={{ backgroundColor: theme.primaryTouch }}
					/>
					<Text style={{ color: theme.primaryLight, fontSize: size.text.small }}>{Player.secondToTime(time.duration)}</Text>
				</View>
			</View>
			<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginEnd: 20, gap: 5 }} >
				<IconButton
					icon={volume ? "volume-up" : "volume-off"}
					size={17}
					color={theme.primaryLight}
					style={{ width: 27 }}
					onPress={() => Player.setVolume(volume ? 0 : 1)}
				/>
				<SlideBar
					progress={volume}
					onStart={(progress) => Player.setVolume(progress)}
					onChange={(progress) => Player.setVolume(progress)}
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
		</View >
	)
}

const styles = StyleSheet.create({
	boxPlayerImage: {
		height: 56,
		width: 56,
		marginRight: 10,
		borderRadius: 4,
	},
})

export default BoxDesktopPlayer;