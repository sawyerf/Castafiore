import React from 'react';
import { Text, View, Dimensions, Modal, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/contexts/config';
import { SongContext, SongDispatchContext } from '~/contexts/song';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import Player from '~/utils/player';
import FavoritedButton from '~/components/button/FavoritedButton';
import IconButton from '~/components/button/IconButton';
import Lyric from '~/components/player/Lyric';
import mainStyles from '~/styles/main';
import SlideBar from '~/components/button/SlideBar';
import SlideControl from '~/components/button/SlideControl';
import SongItem from '~/components/lists/SongItem';
import ImageError from '~/components/ImageError';
import size from '~/styles/size';
import PlayButton from '~/components/button/PlayButton';

const preview = {
	COVER: 0,
	QUEUE: 1,
	LYRICS: 2
}

const FullScreenPlayer = ({ setFullScreen }) => {
	const [isPreview, setIsPreview] = React.useState(preview.COVER)
	const song = React.useContext(SongContext)
	const songDispatch = React.useContext(SongDispatchContext)
	const config = React.useContext(ConfigContext)
	const insets = useSafeAreaInsets();
	const theme = React.useContext(ThemeContext)
	const time = Player.updateTime()
	const [fakeTime, setFakeTime] = React.useState(-1)
	const scroll = React.useRef(null)

	React.useEffect(() => {
		setIsPreview(preview.COVER)
	}, [song.songInfo])

	return (
		<Modal
			statusBarTranslucent={true}
			onRequestClose={() => setFullScreen(false)}
		>
			<View style={[ mainStyles.contentMainContainer(insets), styles.mainContainer(insets, theme)]}>
				<IconButton
					style={{
						width: '100%',
						paddingVertical: 20,
						paddingHorizontal: 25,
					}}
					icon="chevron-down"
					color={theme.primaryLight}
					onPress={() => setFullScreen(false)} />
				<View style={styles.playerContainer}>
					{
						isPreview == preview.COVER &&
						<SlideControl style={styles.albumImage()}>
							<ImageError
								source={{ uri: urlCover(config, song?.songInfo?.albumId) }}
								style={[styles.albumImage(), {
									backgroundColor: theme.secondaryDark,
								}]}
							/>
						</SlideControl>
					}
					{
						isPreview == preview.QUEUE &&
						<FlatList
							style={[styles.albumImage(), { borderRadius: null }]}
							contentContainerStyle={{ width: '100%' }}
							ref={scroll}
							data={song.queue}
							keyExtractor={(item, index) => index}
							initialNumToRender={song.queue.length}
							showsVerticalScrollIndicator={false}
							onLayout={() => scroll.current.scrollToIndex({ index: song.index, animated: false, viewOffset: 0, viewPosition: 0.5 })}
							onScrollToIndexFailed={() => { }}
							renderItem={({ item, index }) => (
								<SongItem
									song={item}
									queue={song.queue}
									index={index}
									isPlaying={song.index === index}
								/>
							)}
						/>
					}
					{
						isPreview == preview.LYRICS &&
						<Lyric song={song} time={time} style={styles.albumImage()} />
					}
					<View style={{ flexDirection: 'row', marginTop: 20, width: '100%' }}>
						<View style={{ flex: 1 }}>
							<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: size.title.small, fontWeight: 'bold' }}>{song.songInfo.title}</Text>
							<Text numberOfLines={1} style={{ color: theme.secondaryLight, fontSize: size.text.large, }}>{song.songInfo.artist} · {song.songInfo.album}</Text>
						</View>
						<FavoritedButton id={song.songInfo.id} isFavorited={song.songInfo.starred} style={{ padding: 20, paddingEnd: 0 }} />
					</View>
					<SlideBar
						progress={fakeTime < 0 ? time.position / time.duration : fakeTime}
						onStart={(progress) => Player.pauseSong() && setFakeTime(progress)}
						onChange={(progress) => setFakeTime(progress)}
						onComplete={(progress) => Player.setPosition(progress * time.duration) && Player.resumeSong() && setTimeout(() => setFakeTime(-1), 500)}
						stylePress={{ width: '100%', height: 26, paddingVertical: 10, marginTop: 10 }}
						styleBar={{ width: '100%', height: '100%', borderRadius: 3, overflow: 'hidden' }}
						styleProgress={{ backgroundColor: theme.primaryTouch }}
						isBitogno={true}
					/>

					<View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
						<Text style={{ color: theme.primaryLight, fontSize: size.text.small }}>{Player.secondToTime(fakeTime < 0 ? time.position : fakeTime * time.duration)}</Text>
						<Text style={{ color: theme.primaryLight, fontSize: size.text.small }}>{Player.secondToTime(time.duration)}</Text>
					</View>
					<View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginTop: 30 }}>
						<IconButton
							icon="step-backward"
							size={size.icon.large}
							color={theme.primaryLight}
							style={{ paddingHorizontal: 10 }}
							onPress={() => Player.previousSong(config, song, songDispatch)}
						/>
						<PlayButton
							size={size.icon.large}
							color={theme.primaryLight}
							style={{ paddingHorizontal: 10 }}
						/>
						<IconButton
							icon="step-forward"
							size={size.icon.large}
							color={theme.primaryLight}
							style={{ paddingHorizontal: 10 }}
							onPress={() => Player.nextSong(config, song, songDispatch)}
						/>
					</View>
					<View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 30 }}>
						<IconButton
							icon="repeat"
							size={19}
							color={song.actionEndOfSong == 'repeat' ? theme.primaryTouch : theme.secondaryLight}
							style={{ paddingVertical: 10, paddingEnd: 20 }}
							onPress={() => {
								Player.setRepeat(songDispatch, song.actionEndOfSong === 'repeat' ? 'next' : 'repeat')
							}}
						/>
						<IconButton
							icon="comment-o"
							size={19}
							color={isPreview == preview.LYRICS ? theme.primaryTouch : theme.secondaryLight}
							style={{ paddingVertical: 10 }}
							onPress={() => setIsPreview(isPreview == preview.LYRICS ? preview.COVER : preview.LYRICS)}
						/>
						<IconButton
							icon="bars"
							size={19}
							color={isPreview == preview.QUEUE ? theme.primaryTouch : theme.secondaryLight}
							style={{ paddingVertical: 10, paddingStart: 20 }}
							onPress={() => setIsPreview(isPreview == preview.QUEUE ? preview.COVER : preview.QUEUE)}
						/>
					</View>
				</View>
			</View>
		</Modal >
	)
}

const styles = StyleSheet.create({
	mainContainer: (insets, theme) => ({
		width: '100%',
		height: '100%',
		paddingBottom: insets.bottom,
		backgroundColor: theme.primaryDark,
		alignItems: 'center',
	}),
	playerContainer: {
		paddingHorizontal: 25,
		maxWidth: 500,
		width: '100%',
		height: '100%',
		alignItems: 'center',
		flexDirection: 'column',
		flex: 1,
		justifyContent: 'center',
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
})

export default FullScreenPlayer;