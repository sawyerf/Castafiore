import React from 'react';
import { Text, View, Image, ScrollView, Dimensions, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SongContext } from '~/contexts/song';
import { nextSong, previousSong, pauseSong, resumeSong } from '~/utils/player';

import { ThemeContext } from '~/contexts/theme';
import mainStyles from '~/styles/main';
import { ConfigContext } from '~/contexts/config';
import { urlCover, getApi } from '~/utils/api';
import SongsList from '~/components/lists/SongsList';
import FavoritedButton from '~/components/button/FavoritedButton';
import IconButton from '~/components/button/IconButton';
import { setPosition } from '~/utils/player';

const FullScreenPlayer = ({ fullscreen, time }) => {
	const [song, songDispatch] = React.useContext(SongContext)
	const config = React.useContext(ConfigContext)
	const insets = useSafeAreaInsets();
	const [isQueue, setIsQueue] = React.useState(false)
	const [layoutBar, setLayoutBar] = React.useState({ width: 0, height: 0 })
  const theme = React.useContext(ThemeContext)

	React.useEffect(() => {
		setIsQueue(false)
	}, [song.songInfo])

	const secondToTime = (second) => {
		return `${String((second - second % 60) / 60).padStart(2, '0')}:${String((second - second % 1) % 60).padStart(2, '0')}`
	}

	return (
		<Modal>
			<View
				style={{
					...mainStyles.mainContainer(insets, theme),
					...styles.mainContainer(insets, theme),
				}}
			>
				<IconButton
					style={{
						width: '100%',
						paddingVertical: 20,
						paddingHorizontal: 25,
					}}
					icon="chevron-down"
					color={theme.primaryLight}
					onPress={() => fullscreen.set(false)} />
				<View style={styles.playerContainer}>
					{!isQueue ?
						<Image
							source={{ uri: urlCover(config, song?.songInfo?.albumId) }}
							style={styles.albumImage()}
						/> :
						<ScrollView style={{ ...styles.albumImage(), borderRadius: null }} showsVerticalScrollIndicator={false}>
							<SongsList config={config} songs={song.queue} isMargin={false} indexPlaying={song.index} />
						</ScrollView>
					}
					<View style={{ flexDirection: 'row', marginTop: 20, width: '100%' }}>
						<View style={{ flex: 1 }}>
							<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: 26, fontWeight: 'bold' }}>{song.songInfo.title}</Text>
							<Text numberOfLines={1} style={{ color: theme.secondaryLight, fontSize: 20, }}>{song.songInfo.artist} · {song.songInfo.album}</Text>
						</View>
						<FavoritedButton id={song.songInfo.id} isFavorited={song.songInfo.starred} config={config} style={{ flex: 'initial', padding: 20, paddingEnd: 0 }} />
					</View>
					<Pressable
						style={{ width: '100%', height: 26, paddingVertical: 10, marginTop: 10 }}
						onPressIn={({ nativeEvent }) => setPosition(song.sound, (nativeEvent.locationX / layoutBar.width) * time.duration)}
						onLayout={({ nativeEvent }) => setLayoutBar({ width: nativeEvent.layout.width, height: nativeEvent.layout.height })}
					>
						<View style={{ width: '100%', height: '100%', borderRadius: 3, backgroundColor: theme.primaryLight, overflow: 'hidden' }} >
							<View style={{ width: `${(time.position / time.duration) * 100}%`, height: '100%', backgroundColor: theme.primaryTouch }} />
						</View>
						<View style={styles.bitognoBar(time, theme)} />
					</Pressable>

					<View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
						<Text style={{ color: theme.primaryLight, fontSize: 13 }}>{secondToTime(time.position)}</Text>
						<Text style={{ color: theme.primaryLight, fontSize: 13 }}>{secondToTime(time.duration)}</Text>
					</View>
					<View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginTop: 30 }}>
						<IconButton
							icon="step-backward"
							size={30}
							color={theme.primaryLight}
							style={{ paddingHorizontal: 10 }}
							onPress={() => previousSong(config, song, songDispatch)}
						/>
						<IconButton
							icon={song.isPlaying ? 'pause' : 'play'}
							size={30}
							color={theme.primaryLight}
							style={{ paddingHorizontal: 10 }}
							onPress={() => song.isPlaying ? pauseSong(song.sound) : resumeSong(song.sound)}
						/>
						<IconButton
							icon="step-forward"
							size={30}
							color={theme.primaryLight}
							style={{ paddingHorizontal: 10 }}
							onPress={() => nextSong(config, song, songDispatch)}
						/>
					</View>
					<View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 30 }}>
						<IconButton
							icon="repeat"
							size={19}
							color={song.actionEndOfSong == 'repeat' ? theme.primaryTouch : theme.secondaryLight}
							style={{ paddingVertical: 10, paddingEnd: 20 }}
							onPress={() => {
								songDispatch({ type: 'setActionEndOfSong', action: song.actionEndOfSong === 'repeat' ? 'next' : 'repeat' })
							}}
						/>
						<IconButton
							icon="bars"
							size={19}
							style={{ paddingVertical: 10, paddingStart: 20 }}
							onPress={() => setIsQueue(!isQueue)}
						/>
					</View>
				</View>
			</View>
		</Modal >
	)
}

const styles = {
	mainContainer: (insets, theme) => ({
		width: '100%',
		height: '100%',
		backgroundColor: theme.primaryDark,
		alignItems: 'center',
	}),
	playerContainer: {
		paddingHorizontal: 25,
		maxWidth: 500,
		width: '100%',
		alignItems: 'center',
		flexDirection: 'column',
		flex: 1,
		justifyContent: 'center'
	},
	albumImage: () => {
		// it shitcode but it dosn't work with just width and aspectRatio for the songlist (queue)
		let width = Dimensions.get('window').width
		if (width > 500) width = 500
		return {
			maxWidth: width - 50,
			width: width - 50,
			maxHeight: width - 50,
			height: width - 50,
			aspectRatio: 1,
			borderRadius: 10,
		}
	},
	bitognoBar: (time, theme) => ({
		position: 'absolute',
		width: 6,
		height: 12,
		borderRadius: 6,
		backgroundColor: theme.primaryTouch,
		left: `${(time.position / time.duration - 0.01) * 100}%`, top: 7
	})
}

export default FullScreenPlayer;