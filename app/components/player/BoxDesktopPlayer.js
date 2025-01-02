import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext } from '~/contexts/config';
import { SongContext } from '~/contexts/song';
import { ThemeContext } from '~/contexts/theme';
import { nextSong, pauseSong, resumeSong, previousSong, setPosition, secondToTime, setVolume, updateVolume, setRepeat, updateTime } from '~/utils/player';
import { urlCover } from '~/utils/api';
import IconButton from '~/components/button/IconButton';
import ImageError from '~/components/ImageError';
import SlideBar from '~/components/button/SlideBar';
import FavoritedButton from '~/components/button/FavoritedButton';

const BoxDesktopPlayer = ({ fullscreen }) => {
	const [song, songDispatch] = React.useContext(SongContext)
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const time = updateTime()
	const volume = updateVolume()

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
			<View style={{ flexDirection: 'row', flex: 1 }}>
				<Pressable
					style={styles.boxPlayerImage}
					onPress={() => fullscreen.set(true)}
				>
					<ImageError
						source={{ uri: urlCover(config, song?.songInfo?.albumId, 100), }}
						style={styles.boxPlayerImage}
					>
						<View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
							<Icon name="music" size={23} color={theme.primaryLight} />
						</View>
					</ImageError>
				</Pressable>
				<View style={{ justifyContent: 'center', gap: 2, flex: 'min-content', maxWidth: 'min-content' }}>
					<Text style={{ color: theme.primaryLight, fontWeight: 'bold', maxWidth: 400 }} numberOfLines={1}>{song?.songInfo?.track ? `${song?.songInfo?.track}. ` : null}{song?.songInfo?.title ? song.songInfo.title : 'Song title'}</Text>
					<Text style={{ color: theme.secondaryLight, maxWidth: 400 }} numberOfLines={1}>{song?.songInfo?.artist ? song.songInfo.artist : 'Artist'}</Text>
				</View>
				<FavoritedButton
					id={song?.songInfo?.id}
					isFavorited={song?.songInfo?.starred}
					config={config}
					size={19}
					style={{ marginHorizontal: 15, padding: 5 }}
				/>
			</View>
			<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 7 }}>
				<View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
					<IconButton
						icon="repeat"
						style={{ width: 22, alignItems: 'end' }}
						size={19}
						color={song.actionEndOfSong == 'repeat' ? theme.primaryTouch : theme.secondaryLight}
						onPress={() => {
							setRepeat(songDispatch, song.actionEndOfSong === 'repeat' ? 'next' : 'repeat')
						}}
					/>
					<IconButton
						icon="step-backward"
						style={{ width: 10, alignItems: 'end' }}
						size={17}
						color={theme.primaryLight}
						onPress={() => previousSong(config, song, songDispatch)}
					/>
					<IconButton
						icon={song.isPlaying ? 'pause' : 'play'}
						style={{ width: 20, alignItems: 'center' }}
						size={19}
						color={theme.primaryLight}
						onPress={() => song.isPlaying ? pauseSong() : resumeSong()}
					/>
					<IconButton
						icon="step-forward"
						style={{ width: 10, alignItems: 'start' }}
						size={17}
						color={theme.primaryLight}
						onPress={() => nextSong(config, song, songDispatch)}
					/>
					<IconButton
						icon="bars"
						size={19}
						style={{ width: 22, alignItems: 'start' }}
						color={theme.secondaryLight}
					/>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, maxWidth: '100%' }}>
					<Text style={{ color: theme.primaryLight, fontSize: 13 }}>{secondToTime(time.position)}</Text>
					<SlideBar
						progress={time.position / time.duration}
						onPress={(progress) => setPosition(progress * time.duration)}
						stylePress={{ flex: 1, height: 6 }}
						styleBar={{ width: '100%', height: '100%', borderRadius: 3, backgroundColor: theme.primaryLight, overflow: 'hidden' }}
						styleProgress={{ backgroundColor: theme.primaryTouch }}
					/>
					<Text style={{ color: theme.primaryLight, fontSize: 13 }}>{secondToTime(time.duration)}</Text>
				</View>
			</View>
			<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginEnd: 20, gap: 5 }} >
				{
					volume ?
						<IconButton
							icon="volume-up"
							size={17}
							color={theme.primaryLight}
							style={{ width: 27 }}
							onPress={() => setVolume(0)}
						/>
						: <IconButton
							icon="volume-off"
							size={17}
							style={{ width: 27 }}
							color={theme.primaryLight}
							onPress={() => setVolume(1)}
						/>
				}
				<SlideBar
					progress={volume}
					onPress={(progress) => setVolume(progress)}
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

const styles = {
	boxPlayerImage: {
		height: 56,
		width: 56,
		marginRight: 10,
		borderRadius: 4,
	},
}

export default BoxDesktopPlayer;