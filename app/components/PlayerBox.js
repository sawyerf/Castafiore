import React from 'react';
import { Text, View, TextInput, Image, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import { SoundContext, nextSong, previousSong } from '~/utils/playSong';
import theme from '~/utils/theme';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import { ConfigContext } from '~/utils/config';
import { urlCover, getApi } from '~/utils/api';
import SongsList from './SongsList';
import FavoritedButton from './button/FavoritedButton';
import IconButton from './button/IconButton';

const PlayerBox = ({ navigation, state }) => {
	const insets = useSafeAreaInsets();
	const sound = React.useContext(SoundContext)
	const config = React.useContext(ConfigContext)
	const [isPlaying, setIsPlaying] = React.useState(false)
	const [timer, setTimer] = React.useState({
		current: 0,
		total: 0,
	})
	const [isFullScreen, setIsFullScreen] = React.useState(false)
	const [isQueue, setIsQueue] = React.useState(false)

	React.useEffect(() => {
		sound.setOnPlaybackStatusUpdate((playbackStatus) => {
			setIsPlaying(playbackStatus.isPlaying)
			if (playbackStatus.isLoaded) {
				setTimer({
					current: playbackStatus.positionMillis / 1000,
					total: playbackStatus.durationMillis / 1000,
				})
			}
			if (playbackStatus.didJustFinish) {
				const id = sound.songInfo.id
				setTimeout(() => nextSong(config, sound), 500)
				getApi(config, 'scrobble', `id=${id}&submission=true`)
					.catch((error) => { })
			}
		})
		if (Platform.OS === 'web') {
			navigator.mediaSession.setActionHandler("pause", () => {
				sound.pauseAsync()
			});
			navigator.mediaSession.setActionHandler("play", () => {
				sound.playAsync()
				fetch('/lolipop/keepAppUp')
			});
			navigator.mediaSession.setActionHandler("previoustrack", () => {
				setTimeout(() => previousSong(config, sound), 500)
			});
			navigator.mediaSession.setActionHandler("nexttrack", () => {
				setTimeout(() => nextSong(config, sound), 500)
			});
			navigator.mediaSession.setActionHandler("seekbackward", () => {
				setTimeout(() => previousSong(config, sound), 500)
			});
			navigator.mediaSession.setActionHandler("seekforward", () => {
				setTimeout(() => nextSong(config, sound), 500)
			});
		}
	}, [sound])

	React.useEffect(() => {
		setIsFullScreen(false)
	}, [state.index])

	React.useEffect(() => {
		setIsQueue(false)
	}, [isFullScreen, sound.songInfo])

	const secondToTime = (second) => {
		return `${String((second - second % 60) / 60).padStart(2, '0')}:${String((second - second % 1) % 60).padStart(2, '0')}`
	}

	if (sound?.songInfo) {
		if (!isFullScreen) {
			return (
				<TouchableOpacity
					onPress={() => setIsFullScreen(true)}
					activeOpacity={1}
					style={{
						position: 'absolute',
						bottom: (insets.bottom ? insets.bottom : 15) + 53,
						left: insets.left,
						right: insets.right,

						flexDirection: 'row',
						backgroundColor: theme.secondaryDark,
						padding: 10,
						margin: 10,
						borderRadius: 10,
					}}>
					<View style={{ ...styles.boxPlayerImage, flex: Platform.OS === 'android' ? 0 : 'initial' }}>
						<Icon name="music" size={23} color={theme.primaryLight} style={{ position: 'absolute', top: 9, left: 9 }} />
						<Image
							style={styles.boxPlayerImage}
							source={{
								uri: urlCover(config, sound?.songInfo?.albumId, 100),
							}}
						/>
					</View>
					<View style={styles.boxPlayerText}>
						<Text style={{ color: theme.primaryLight, flex: 1 }} numberOfLines={1}>{sound?.songInfo?.track ? `${sound?.songInfo?.track}. ` : null}{sound?.songInfo?.title ? sound.songInfo.title : 'Song title'}</Text>
						<Text style={{ color: theme.secondaryLight, flex: 1 }} numberOfLines={1}>{sound?.songInfo?.artist ? sound.songInfo.artist : 'Artist'}</Text>
					</View>
					<View style={styles.boxPlayerButton}>
						<IconButton
							icon="step-forward"
							size={23}
							color={theme.primaryTouch}
							style={{ paddingHorizontal: 10 }}
							onPress={() => nextSong(config, sound)}
						/>
						<IconButton
							icon={isPlaying ? 'pause' : 'play'}
							size={23}
							color={theme.primaryTouch}
							style={{ paddingHorizontal: 10 }}
							onPress={() => isPlaying ? sound.pauseAsync() : sound.playAsync()}
						/>
					</View>
				</TouchableOpacity>
			)
		} else {
			return (
				<View style={{
					...mainStyles.mainContainer(insets),
					backgroundColor: theme.primaryDark,
					alignItems: 'center',
					position: 'absolute',
					bottom: 0,
					left: insets.left,
					right: insets.right,
					height: Dimensions.get('window').height,
					width: '100%'
				}}>
					<TouchableOpacity style={{
						position: 'absolute',
						top: insets.top,
						left: insets.left,
						padding: 20,
						zIndex: 2,
					}} onPress={() => setIsFullScreen(false)}>
						<Icon name="chevron-left" size={23} color={theme.primaryLight} />
					</TouchableOpacity>
					<View style={{ paddingHorizontal: 25, maxWidth: 500, width: '100%', alignItems: 'center', flexDirection: 'column' }}>
						{!isQueue ?
							<Image
								source={{ uri: urlCover(config, sound?.songInfo?.albumId) }}
								style={styles.albumImage}
							/> :
							<ScrollView style={{ ...styles.albumImage, width: '100%', aspectRatio: 100 / 90, }} showsVerticalScrollIndicator={false}>
								<SongsList config={config} songs={sound.songList} />
							</ScrollView>
						}

						<View style={{ flexDirection: 'row', marginTop: 20, width: '100%' }}>
							<View style={{ flex: 1 }}>
								<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: 26, fontWeight: 'bold' }}>{sound.songInfo.title}</Text>
								<Text numberOfLines={1} style={{ color: theme.secondaryLight, fontSize: 20, }}>{sound.songInfo.artist} · {sound.songInfo.album}</Text>
							</View>
							<FavoritedButton id={sound.songInfo.id} isFavorited={sound.songInfo.starred} config={config} style={{ flex: 'initial', padding: 20, paddingEnd: 0 }} />
						</View>
						<View style={{ width: '100%', height: 6, borderRadius: 3, backgroundColor: theme.primaryLight, marginTop: 30, overflow: 'hidden' }} >
							<View style={{ width: `${(timer.current / timer.total) * 100}%`, height: '100%', backgroundColor: theme.primaryTouch }} />
						</View>
						<View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 10 }}>
							<Text style={{ color: theme.primaryLight, fontSize: 13 }}>{secondToTime(timer.current)}</Text>
							<Text style={{ color: theme.primaryLight, fontSize: 13 }}>{secondToTime(timer.total)}</Text>
						</View>
						<View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginTop: 30 }}>
							<IconButton
								icon="step-backward"
								color={theme.primaryLight}
								style={{ paddingHorizontal: 10 }}
								onPress={() => previousSong(config, sound)}
							/>
							<IconButton
								icon={isPlaying ? 'pause' : 'play'}
								color={theme.primaryLight}
								style={{ paddingHorizontal: 10 }}
								onPress={() => isPlaying ? sound.pauseAsync() : sound.playAsync()}
							/>
							<IconButton
								icon="step-forward"
								color={theme.primaryLight}
								style={{ paddingHorizontal: 10 }}
								onPress={() => nextSong(config, sound)}
							/>
						</View>
						<View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 30 }}>
							<IconButton
								icon="bluetooth-b"
								size={19}
								onPress={() => { }}
							/>
							<IconButton
								icon="bars"
								size={19}
								onPress={() => setIsQueue(!isQueue)}
							/>
						</View>
					</View>
				</View >
			)
		}
	}
	return null;
}

const styles = {
	boxPlayerImage: {
		height: 40,
		width: 40,
		marginRight: 10,
		borderRadius: 4,
	},
	boxPlayerText: {
		flex: 1,
	},
	boxPlayerButton: {
		flex: Platform.OS === 'android' ? 0 : 'initial',
		flexDirection: 'row',
	},
	button: {
		padding: 10,
	},
	albumImage: {
		// height: Dimensions.get('window').width * 0.80,
		// maxWidth: 350,
		width: '90%',
		aspectRatio: 1,
		borderRadius: 10,
		marginTop: 100,
	}
}

export default PlayerBox;