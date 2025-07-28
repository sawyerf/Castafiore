import React from 'react';
import { Text, View, Modal, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/contexts/config';
import { SongContext, SongDispatchContext } from '~/contexts/song';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import FavoritedButton from '~/components/button/FavoritedButton';
import IconButton from '~/components/button/IconButton';
import ImageError from '~/components/ImageError';
import Lyric from '~/components/player/Lyric';
import mainStyles from '~/styles/main';
import OptionsQueue from '~/components/options/OptionsQueue';
import PlayButton from '~/components/button/PlayButton';
import Player from '~/utils/player';
import size from '~/styles/size';
import SlideBar from '~/components/button/SlideBar';
import SlideControl from '~/components/button/SlideControl';
import SongItem from '~/components/item/SongItem';

const preview = {
	COVER: 0,
	QUEUE: 1,
	LYRICS: 2
}

const CoverItem = ({ isPreview, song, setFullScreen }) => {
	const scroll = React.useRef(null)
	const config = React.useContext(ConfigContext);
	const theme = React.useContext(ThemeContext);
	const songDispatch = React.useContext(SongDispatchContext);
	const [indexOptions, setIndexOptions] = React.useState(-1);
	const { width } = useWindowDimensions();

	React.useEffect(() => {
		if (isPreview === preview.QUEUE) scroll.current.scrollToIndex({ index: song.index, animated: true, viewOffset: 0, viewPosition: 0.5 });
	}, [song.index]);

	const albumImage = React.useMemo(() => {
		const size = Math.min(width, 500) - 50
		return {
			maxWidth: size,
			width: size,
			maxHeight: size,
			height: size,
			minwidth: size,
			minHeight: size,
			aspectRatio: 1,
			borderRadius: 10,
		}
	}, [width]);

	if (isPreview === preview.COVER) return (
		<SlideControl style={albumImage}>
			<ImageError
				source={{ uri: urlCover(config, song?.songInfo) }}
				style={[albumImage, { backgroundColor: theme.secondaryBack }]}
			/>
		</SlideControl>
	)
	if (isPreview === preview.QUEUE) return (
		<>
			<FlatList
				style={[albumImage, { borderRadius: null }]}
				contentContainerStyle={{ width: '100%' }}
				ref={scroll}
				data={song.queue}
				keyExtractor={(_, index) => index}
				showsVerticalScrollIndicator={false}
				onLayout={() => scroll.current.scrollToIndex({ index: song.index, animated: false, viewOffset: 0, viewPosition: 0.5 })}
				getItemLayout={(_, index) => ({ length: size.image.small + 10, offset: (size.image.small + 10) * index, index })}
				onScrollToIndexFailed={() => { }}
				renderItem={({ item, index }) => (
					<SongItem
						song={item}
						queue={song.queue}
						index={index}
						setIndexOptions={setIndexOptions}
						onPress={(_track, queue, index) => {
							Player.setIndex(config, songDispatch, queue, index)
						}}
						isPlaying={song.index === index}
					/>
				)}
			/>
			<OptionsQueue queue={song.queue} indexOptions={indexOptions} setIndexOptions={setIndexOptions} closePlayer={() => setFullScreen(false)} />
		</>
	)
	if (isPreview === preview.LYRICS) return (
		<Lyric song={song} style={albumImage} />
	)
}

const TimeBar = () => {
	const [fakeTime, setFakeTime] = React.useState(-1)
	const theme = React.useContext(ThemeContext)
	const time = Player.updateTime()
	const song = React.useContext(SongContext)
	const [duration, setDuration] = React.useState(0)

	React.useEffect(() => {
		if (song.songInfo?.isLiveStream) {
			setDuration(Infinity)
		} else if ((time.duration === 0 || time.duration === Infinity) && song.songInfo?.duration) {
			setDuration(song.songInfo.duration || 0)
		} else {
			setDuration(time.duration)
		}
	}, [time.duration])

	return (
		<>
			<SlideBar
				disable={time.duration === 0 || duration === Infinity}
				progress={fakeTime < 0 ? time.position / duration : fakeTime}
				onStart={(progress) => Player.pauseSong() && setFakeTime(progress)}
				onChange={(progress) => setFakeTime(progress)}
				onComplete={(progress) => Player.setPosition(progress * duration) && Player.resumeSong() && setTimeout(() => setFakeTime(-1), 500)}
				stylePress={{ width: '100%', height: 24, paddingVertical: 10, marginTop: 10 }}
				styleBar={{ width: '100%', height: '100%', borderRadius: size.radius.circle, overflow: 'hidden' }}
				isBitogno={song.songInfo?.isLiveStream ? false : true}
			/>

			<View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
				<Text style={{ color: theme.primaryText, fontSize: size.text.small }}>{Player.secondToTime(fakeTime < 0 ? time.position : fakeTime * duration)}</Text>
				<Text style={{ color: theme.primaryText, fontSize: size.text.small }}>{Player.secondToTime(duration)}</Text>
			</View>
		</>
	)
}

const FullScreenPlayer = ({ setFullScreen }) => {
	const songDispatch = React.useContext(SongDispatchContext)
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const song = React.useContext(SongContext)
	const insets = useSafeAreaInsets();
	const [isPreview, setIsPreview] = React.useState(preview.COVER)

	// React.useEffect(() => {
	// 	setIsPreview(preview.COVER)
	// }, [song.songInfo])

	return (
		<Modal
			statusBarTranslucent={true}
			navigationBarTranslucent={true}
			onRequestClose={() => setFullScreen(false)}
		>
			<View style={[mainStyles.contentMainContainer(insets), styles.mainContainer(insets, theme)]}>
				<IconButton
					style={{
						width: '100%',
						paddingVertical: 20,
						paddingHorizontal: 25,
					}}
					icon="chevron-down"
					color={theme.primaryText}
					onPress={() => setFullScreen(false)} />
				<View style={styles.playerContainer}>
					<CoverItem isPreview={isPreview} song={song} setFullScreen={setFullScreen} />
					<View style={{ flexDirection: 'row', marginTop: 15, width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
						<View style={{ flex: 1 }}>
							<Text numberOfLines={1} style={{ color: theme.primaryText, fontSize: size.title.small, textAlign: 'left', fontWeight: 'bold' }}>{song.songInfo.title}</Text>
							<Text numberOfLines={1} style={mainStyles.largeText(theme.secondaryText)}>{song.songInfo.artist}</Text>
						</View>
						<FavoritedButton id={song.songInfo.id} isFavorited={song.songInfo.starred} style={{ padding: 20, paddingEnd: 0 }} />
					</View>
					<TimeBar />
					<View style={{ flexDirection: 'row', width: '100%', marginVertical: 30, alignItems: 'center', justifyContent: 'center', gap: 30 }}>
						<IconButton
							icon="step-backward"
							size={size.icon.large}
							color={theme.primaryText}
							style={{ padding: 10 }}
							onPress={() => Player.previousSong(config, song, songDispatch)}
						/>
						<PlayButton
							size={50}
							color={theme.primaryText}
							style={{
								paddingHorizontal: 10,
								minWidth: 63,
								justifyContent: 'center',
								alignItems: 'center',
							}}
						/>
						<IconButton
							icon="step-forward"
							size={size.icon.large}
							color={theme.primaryText}
							style={{ padding: 10 }}
							onPress={() => Player.nextSong(config, song, songDispatch)}
						/>
					</View>
					<View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
						<IconButton
							icon="comment-o"
							size={17}
							color={isPreview == preview.LYRICS ? theme.primaryTouch : theme.secondaryText}
							style={{ paddingVertical: 10, paddingEnd: 10 }}
							onPress={() => setIsPreview(isPreview == preview.LYRICS ? preview.COVER : preview.LYRICS)}
						/>
						<IconButton
							icon="repeat"
							size={17}
							color={song.actionEndOfSong == 'repeat' ? theme.primaryTouch : theme.secondaryText}
							style={{ paddingVertical: 10, paddingHorizontal: 10 }}
							onPress={() => {
								Player.setRepeat(songDispatch, song.actionEndOfSong === 'repeat' ? 'next' : 'repeat')
							}}
						/>
						<IconButton
							icon="random"
							size={17}
							color={song.actionEndOfSong == 'random' ? theme.primaryTouch : theme.secondaryText}
							style={{ paddingVertical: 10, paddingHorizontal: 10 }}
							onPress={() => Player.setRepeat(songDispatch, song.actionEndOfSong === 'random' ? 'next' : 'random')}
						/>
						<IconButton
							icon="bars"
							size={17}
							color={isPreview == preview.QUEUE ? theme.primaryTouch : theme.secondaryText}
							style={{ paddingVertical: 10, paddingStart: 10 }}
							onPress={() => setIsPreview(isPreview == preview.QUEUE ? preview.COVER : preview.QUEUE)}
						/>
					</View>
				</View>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	mainContainer: (insets, theme) => ({
		width: '100%',
		height: '100%',
		paddingBottom: insets.bottom,
		backgroundColor: theme.primaryBack,
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
})

export default FullScreenPlayer;