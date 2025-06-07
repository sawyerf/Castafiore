import React from 'react'
import { Modal, View, Text, Image, FlatList, Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useWindowDimensions } from 'react-native'

import { ConfigContext } from '~/contexts/config'
import { SongContext, SongDispatchContext } from '~/contexts/song'
import { ThemeContext } from '~/contexts/theme'
import { urlCover } from '~/utils/api'
import FavoritedButton from '~/components/button/FavoritedButton'
import IconButton from '~/components/button/IconButton'
import ImageError from '~/components/ImageError'
import Lyric from '~/components/player/Lyric'
import Player from '~/utils/player'
import size from '~/styles/size';
import SlideBar from '~/components/button/SlideBar'
import SlideControl from '~/components/button/SlideControl'
import mainStyles from '~/styles/main'
import PlayButton from '~/components/button/PlayButton'

const preview = {
	COVER: 0,
	QUEUE: 1,
	LYRICS: 2
}

const color = {
	primary: '#fff',
	secondary: '#c6c6c6'
}

const FullScreenHorizontalPlayer = ({ setFullScreen }) => {
	const [isPreview, setIsPreview] = React.useState(preview.COVER)
	const config = React.useContext(ConfigContext)
	const insets = useSafeAreaInsets()
	const song = React.useContext(SongContext)
	const songDispatch = React.useContext(SongDispatchContext)
	const theme = React.useContext(ThemeContext)
	const time = Player.updateTime()
	const volume = Player.updateVolume()
	const [fakeTime, setFakeTime] = React.useState(-1)
	const scroll = React.useRef(null)
	const { height } = useWindowDimensions()

	React.useEffect(() => {
		if (isPreview == preview.LYRICS) setIsPreview(preview.COVER)
		if (isPreview == preview.QUEUE) scroll.current.scrollToIndex({ index: song.index, animated: false, viewOffset: 0, viewPosition: 0.5 })
	}, [song.index, song.songInfo])

	return (
		<Modal
			statusBarTranslucent={true}
			onRequestClose={() => setFullScreen(false)}
		>
			<Image
				source={{ uri: urlCover(config, song?.songInfo) }}
				style={styles.backgroundImage}
				blurRadius={5}
			/>
			<View style={{
				flex: 1,
				width: '100%',
				height: '100%',
				backgroundColor: 'rgba(0, 0, 0, 0.6)',
				paddingTop: insets.top + 10 < 50 ? 50 : insets.top + 10,
				paddingBottom: insets.bottom + 10 < 50 ? 50 : insets.bottom + 10,
				paddingStart: insets.left + 10 < 50 ? 50 : insets.left + 10,
				paddingEnd: insets.right + 10 < 50 ? 50 : insets.right + 10,
				gap: 20,
			}}>
				{
					isPreview == preview.LYRICS &&
					<View style={{ flex: 2, alignItems: 'center' }}>
						<Lyric
							song={song}
							time={time}
							sizeText={30}
							color={{
								active: color.primary,
								inactive: color.secondary
							}}
							style={{
								width: '100%',
								maxWidth: 700,
							}}
						/>
					</View>
				}
				<View
					style={{
						flex: isPreview === preview.LYRICS ? undefined : 1,
						display: isPreview === preview.LYRICS && height < 800 ? 'none' : 'flex',
						flexDirection: 'row',
					}}
				>
					<SlideControl
						style={{
							flex: 2,
							justifyContent: 'flex-start',
							alignItems: 'flex-end',
							flexDirection: 'row',
						}}
					>
						<ImageError style={styles.imageCover} source={{ uri: urlCover(config, song?.songInfo) }} />
						<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
							<FavoritedButton
								id={song?.songInfo?.id}
								isFavorited={song?.songInfo?.starred}
								size={size.icon.medium}
								style={{ padding: 0, paddingBottom: 10, marginStart: 20, width: 'min-content' }}
							/>
							<Text numberOfLines={1} style={styles.title}>{song?.songInfo?.title}</Text>
							<Text numberOfLines={1} style={styles.artist}>{song?.songInfo?.artist}</Text>
						</View>
					</SlideControl>
					{
						isPreview == preview.QUEUE &&
						<View style={{ flex: 1, maxWidth: '50%', justifyContent: 'flex-end' }}>
							<FlatList
								ref={scroll}
								onLayout={() => scroll.current.scrollToIndex({ index: song.index, animated: false, viewOffset: 0, viewPosition: 0.5 })}
								style={{ height: '100%' }}
								contentContainerStyle={{ width: '100%', minHeight: '100%', justifyContent: 'flex-end' }}
								getItemLayout={(data, index) => ({ length: size.image.small + 10, offset: (size.image.small + 10) * index, index })}
								showsVerticalScrollIndicator={false}
								onScrollToIndexFailed={() => { }}
								data={song.queue}
								keyExtractor={(_, index) => index}
								renderItem={({ item, index }) => (
									<Pressable
										style={({ pressed }) => ([mainStyles.opacity({ pressed }), {
											flexDirection: 'row',
											alignItems: 'center',
											marginBottom: 10,
										}])}
										key={item.id}
										onPress={() => {
											Player.playSong(config, songDispatch, song.queue, index)
										}}>
										<View style={{ flex: 1, flexDirection: 'column' }}>
											<Text numberOfLines={1} style={{ color: song.index === index ? theme.primaryTouch : color.primary, fontSize: size.text.medium, marginBottom: 2, textAlign: 'right' }}>
												{item.title}
											</Text>
											<Text numberOfLines={1} style={{ color: song.index === index ? theme.primaryTouch : color.secondary, fontSize: size.text.small, textAlign: 'right' }}>
												{item.artist}
											</Text>
										</View>
										<ImageError
											style={[mainStyles.coverSmall(theme), { marginStart: 10 }]}
											source={{
												uri: urlCover(config, item, 100),
											}}
										/>
									</Pressable>
								)}
							/>
						</View>
					}
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, maxWidth: '100%' }}>
					<Text style={{ color: color.primary, fontSize: size.text.small }}>{fakeTime < 0 ? Player.secondToTime(time.position) : Player.secondToTime(fakeTime * time.duration)}</Text>
					<SlideBar
						progress={fakeTime < 0 ? time.position / time.duration : fakeTime}
						onStart={(progress) => Player.pauseSong() && setFakeTime(progress)}
						onChange={(progress) => setFakeTime(progress)}
						onComplete={(progress) => Player.setPosition(progress * time.duration) && Player.resumeSong() && setTimeout(() => setFakeTime(-1), 500)}
						stylePress={{ flex: 1, height: 26, paddingVertical: 10 }}
						styleBar={{ width: '100%', height: '100%', borderRadius: 3, backgroundColor: color.primary, overflow: 'hidden' }}
						styleProgress={{ backgroundColor: theme.primaryTouch }}
					/>
					<Text style={{ color: color.primary, fontSize: size.text.small }}>{Player.secondToTime(time.duration)}</Text>
				</View>
				<View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
					<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 5 }}>
						<IconButton
							icon="comment-o"
							size={size.icon.medium}
							color={isPreview == preview.LYRICS ? theme.primaryTouch : color.primary}
							onPress={() => setIsPreview(isPreview == preview.LYRICS ? preview.COVER : preview.LYRICS)}
						/>
					</View>
					<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 25 }}>
						<IconButton
							icon="repeat"
							style={{ width: 30, alignItems: 'end' }}
							size={size.icon.medium}
							color={song.actionEndOfSong == 'repeat' ? theme.primaryTouch : theme.secondaryText}
							onPress={() => {
								Player.setRepeat(songDispatch, song.actionEndOfSong === 'repeat' ? 'next' : 'repeat')
							}}
						/>
						<IconButton
							icon="step-backward"
							style={{ alignItems: 'end' }}
							size={size.icon.medium}
							color={color.primary}
							onPress={() => Player.previousSong(config, song, songDispatch)}
						/>
						<PlayButton
							size={size.icon.medium}
							color={color.primary}
							style={{ width: 30, alignItems: 'center' }}
						/>
						<IconButton
							icon="step-forward"
							style={{ alignItems: 'start' }}
							size={size.icon.medium}
							color={color.primary}
							onPress={() => Player.nextSong(config, song, songDispatch)}
						/>
						<IconButton
							icon="bars"
							size={size.icon.medium}
							style={{ width: 30, alignItems: 'start' }}
							color={theme.secondaryText}
							onPress={() => setIsPreview(isPreview == preview.QUEUE ? preview.COVER : preview.QUEUE)}
						/>
					</View>
					<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
						{
							Player.isVolumeSupported() &&
							<>
								<IconButton
									icon={volume ? "volume-up" : "volume-off"}
									size={17}
									color={color.primary}
									style={{ width: 27 }}
									onPress={() => Player.setVolume(volume ? 0 : 1)}
								/>
								<SlideBar
									progress={volume}
									onStart={(progress) => Player.setVolume(progress)}
									onChange={(progress) => Player.setVolume(progress)}
									stylePress={{ maxWidth: 100, height: 25, paddingVertical: 10, width: '100%' }}
									styleBar={{ width: '100%', height: '100%', borderRadius: 3, backgroundColor: color.primary, overflow: 'hidden' }}
									styleProgress={{ backgroundColor: theme.primaryTouch }}
									isBitogno={true}
								/>
							</>
						}
						<IconButton
							icon="expand"
							size={17}
							style={{ padding: 5, paddingHorizontal: 8, marginStart: 15, borderRadius: 4 }}
							color={color.primary}
							onPress={() => setFullScreen(false)}
						/>
					</View>
				</View>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	backgroundImage: {
		flex: 1,
		width: '100%',
		height: '100%',
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
		zIndex: -1,
		backgroundColor: '#000',
	},
	title: {
		color: color.primary,
		fontSize: size.title.medium,
		fontWeight: 'bold',
		marginHorizontal: 20,
	},
	artist: {
		color: color.primary,
		fontSize: size.text.large,
		margin: 20,
		marginTop: 0,
	},
	imageCover: {
		height: 200,
		maxHeight: '100%',
		width: 'auto',
		aspectRatio: 1,
		borderRadius: 5,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
})

export default FullScreenHorizontalPlayer