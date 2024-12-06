import React from 'react';
import { Text, View, Image, ScrollView, Dimensions, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/contexts/config';
import { SongContext } from '~/contexts/song';
import { ThemeContext } from '~/contexts/theme';
import { nextSong, previousSong, pauseSong, resumeSong, secondToTime } from '~/utils/player';
import { parseLrc } from '~/utils/lrc';
import { setPosition } from '~/utils/player';
import { urlCover, getApi } from '~/utils/api';
import FavoritedButton from '~/components/button/FavoritedButton';
import IconButton from '~/components/button/IconButton';
import SlideBar from '~/components/button/SlideBar';
import SongsList from '~/components/lists/SongsList';
import mainStyles from '~/styles/main';

const preview = {
	COVER: 0,
	QUEUE: 1,
	LYRICS: 2
}

const FullScreenPlayer = ({ fullscreen, time }) => {
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const [song, songDispatch] = React.useContext(SongContext)
	const insets = useSafeAreaInsets();
	const [lyrics, setLyrics] = React.useState([])
	const [isPreview, setIsPreview] = React.useState(preview.COVER)

	React.useEffect(() => {
		setIsPreview(preview.COVER)
		setLyrics([])
	}, [song.songInfo])

	const getNavidromeLyrics = () => {
		getApi(config, 'getLyricsBySongId', { id: song.songInfo.id })
			.then(res => {
				const ly = res.lyricsList?.structuredLyrics[0]?.line?.map(ly => ({ time: ly.start / 1000, text: ly.value.length ? ly.value : '...' }))
				if (ly.length == 0) { // not found
					return getLrcLibLyrics()
				}
				ly.sort((a, b) => a.time - b.time)
				setLyrics(ly)
				setIsPreview(preview.LYRICS)
			})
			.catch(() => { // not found
				getLrcLibLyrics()
			})
	}

	const getLrcLibLyrics = () => {
		const params = {
			track_name: song.songInfo.title,
			artist_name: song.songInfo.artist,
			album_name: song.songInfo.album,
			duration: song.songInfo.duration
		}
		fetch('https://lrclib.net/api/get?' + Object.keys(params).map((key) => `${key}=${encodeURIComponent(params[key])}`).join('&'), {
			headers: { 'Lrclib-Client': 'Castafiore' }
		})
			.then(res => res.json())
			.then(res => {
				const ly = parseLrc(res.syncedLyrics)
				setLyrics(ly)
				setIsPreview(preview.LYRICS)
			})
			.catch(() => {
				setIsPreview(preview.LYRICS)
				setLyrics([{ time: 0, text: 'No lyrics found' }])
			})
	}

	const getLyrics = async () => {
		if (isPreview == preview.LYRICS) return setIsPreview(preview.COVER)
		if (lyrics.length > 0) return setIsPreview(preview.LYRICS)
		getNavidromeLyrics()
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
					{
						isPreview == preview.COVER &&
						<Image
							source={{ uri: urlCover(config, song?.songInfo?.albumId) }}
							style={styles.albumImage()}
						/>
					}
					{
						isPreview == preview.QUEUE &&
						<ScrollView style={{ ...styles.albumImage(), borderRadius: null }} showsVerticalScrollIndicator={false}>
							<SongsList config={config} songs={song.queue} isMargin={false} indexPlaying={song.index} />
						</ScrollView>
					}
					{
						isPreview == preview.LYRICS &&
						<ScrollView style={{ ...styles.albumImage(), borderRadius: null }} showsVerticalScrollIndicator={false}>
							{lyrics.map((lyric, index) => {
								if (index < lyrics.length - 2 && time.position >= lyrics[index + 2]?.time) return null
								const isCurrent = time.position >= lyric.time && (lyrics.length == index + 1 || time.position < lyrics[index + 1]?.time)
								return (
									<View style={{
										display: 'flex',
										justifyContent: 'flex-end',
										minHeight: ((time.position > lyric.time && !isCurrent) || !index) ? 62 : 0,
									}}>
										<Text
											key={index}
											style={{
												color: isCurrent ? theme.primaryLight : theme.secondaryLight,
												fontSize: 23,
												textAlign: 'center',
											}}>
											{lyric.text.length ? lyric.text : '...'}
										</Text>
									</View>
								)
							})}
						</ScrollView>
					}
					<View style={{ flexDirection: 'row', marginTop: 20, width: '100%' }}>
						<View style={{ flex: 1 }}>
							<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: 26, fontWeight: 'bold' }}>{song.songInfo.title}</Text>
							<Text numberOfLines={1} style={{ color: theme.secondaryLight, fontSize: 20, }}>{song.songInfo.artist} · {song.songInfo.album}</Text>
						</View>
						<FavoritedButton id={song.songInfo.id} isFavorited={song.songInfo.starred} config={config} style={{ flex: 'initial', padding: 20, paddingEnd: 0 }} />
					</View>
					<SlideBar
						progress={time.position / time.duration}
						onPress={(progress) => setPosition(song.sound, progress * time.duration)}
						stylePress={{ width: '100%', height: 26, paddingVertical: 10, marginTop: 10 }}
						styleBar={{ width: '100%', height: '100%', borderRadius: 3, backgroundColor: theme.primaryLight, overflow: 'hidden' }}
						styleProgress={{ backgroundColor: theme.primaryTouch }}
						isBitogno={true}
					/>

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
							icon="comment-o"
							size={19}
							color={isPreview == preview.LYRICS ? theme.primaryTouch : theme.secondaryLight}
							style={{ paddingVertical: 10 }}
							onPress={() => getLyrics()}
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
}

export default FullScreenPlayer;