import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import { SoundContext, nextSong, previousSong } from '../utils/playSong';
import theme from '../utils/theme';
import mainStyles from '../styles/main';
import presStyles from '../styles/pres';
import { ConfigContext } from '../utils/config';
import { urlCover } from '../utils/api';

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

	React.useEffect(() => {
		sound.setOnPlaybackStatusUpdate((playbackStatus) => {
			setIsPlaying(playbackStatus.isPlaying)
			// if (Platform.OS === 'web') {
			// 	navigator.mediaSession.playbackState = playbackStatus.isPlaying ? "playing" : "paused";
			// }
			if (playbackStatus.isLoaded) {
				setTimer({
					current: playbackStatus.positionMillis / 1000,
					total: playbackStatus.durationMillis / 1000,
				})
			}
			if (playbackStatus.didJustFinish) {
				setTimeout(() => nextSong(config, sound), 500)
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

	const onPressFavorited = () => {
		getApi(config, sound.songInfo.starred ? 'unstar' : 'star', `id=${sound.songInfo.id}`)
			.then((json) => {
				sound.songInfo.starred = !sound.songInfo.starred
			})
			.catch((error) => { })
	}

	const secondToTime = (second) => {
		return `${String((second - second % 60) / 60).padStart(2, '0')}:${String((second - second % 1) % 60).padStart(2, '0')}`
	}

	if (sound?.songInfo) {
		if (!isFullScreen) {
			return (
				<TouchableOpacity
					onPress={() => setIsFullScreen(true)}
					style={{
						position: 'absolute',
						bottom: (insets.bottom ? insets.bottom : 10) + 53,
						left: 0,
						right: 0,

						flexDirection: 'row',
						backgroundColor: theme.secondaryDark,
						padding: 10,
						margin: 10,
						borderRadius: 10,
					}}>
					<View style={{ ...styles.boxPlayerImage, backgroundColor: theme.secondaryTouch, flex: Platform.OS === 'android' ? 0 : 'initial' }}>
						<Icon name="music" size={23} color={theme.primaryLight} style={{ position: 'absolute', top: 9, left: 9 }} />
						<Image
							style={styles.boxPlayerImage}
							source={{
								uri: urlCover(config, sound?.songInfo?.albumId, 100),
							}}
						/>
					</View>
					<View style={styles.boxPlayerText}>
						<Text style={{ color: theme.primaryLight, flex: 1 }} numberOfLines={1}>{sound?.songInfo?.title ? sound.songInfo.title : 'Song title'}</Text>
						<Text style={{ color: theme.secondaryLight, flex: 1 }} numberOfLines={1}>{sound?.songInfo?.artist ? sound.songInfo.artist : 'Artist'}</Text>
					</View>
					<View style={styles.boxPlayerButton}>
						<TouchableOpacity
							onPress={() => nextSong(config, sound)}
							style={{ justifyContent: 'center', paddingHorizontal: 10 }}>
							<Icon name="step-forward" size={23} color={theme.primaryTouch} />
						</TouchableOpacity>
						<TouchableOpacity onPress={() => isPlaying ? sound.pauseAsync() : sound.playAsync()}
							style={{ justifyContent: 'center', paddingHorizontal: 10 }}>
							{
								isPlaying
									? <Icon name="pause" size={23} color={theme.primaryTouch} />
									: <Icon name="play" size={23} color={theme.primaryTouch} />
							}
						</TouchableOpacity>
					</View>
				</TouchableOpacity>
			)
		} else {
			return (
				<View style={{
					...mainStyles.mainContainer(insets),
					backgroundColor: theme.primaryDark,
					flexDirection: 'column',
					alignItems: 'center',
					// justifyContent: 'center',
					paddingStart: insets.left + 20,
					paddingEnd: insets.right + 20,

					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					height: Dimensions.get('window').height,
					width: '100%'
				}}>
					<Image
						source={{ uri: urlCover(config, sound?.songInfo?.albumId) }}
						style={styles.albumImage}
					/>
					<TouchableOpacity style={{
						position: 'absolute',
						top: insets.top,
						left: insets.left,
						padding: 20,
						zIndex: 2,
					}} onPress={() => setIsFullScreen(false)}>
						<Icon name="chevron-left" size={23} color={theme.primaryLight} />
					</TouchableOpacity>

					<View style={{ width: '100%' }}>
						<View style={{ flexDirection: 'column', width: '100%' }}>
							<Text numberOfLines={1} style={{ ...presStyles.title }}>{sound.songInfo.title}</Text>
							<Text numberOfLines={1} style={{ ...presStyles.subTitle }}>{sound.songInfo.artist} · {sound.songInfo.album}</Text>
						</View>

						<TouchableOpacity onPress={() => onPressFavorited()} style={{ padding: 20, marginTop: 3, position: 'absolute', right: 0 }}>
							{sound.songInfo.starred
								? <Icon name="heart" size={23} color={theme.primaryTouch} /> :
								<Icon name="heart-o" size={23} color={theme.primaryTouch} />}
						</TouchableOpacity>
					</View>
					<View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-around' }}>
						<TouchableOpacity style={styles.button} onPress={() => previousSong(config, sound)}>
							<Icon name="step-backward" size={23} color={theme.primaryLight} />
						</TouchableOpacity>
						<TouchableOpacity style={styles.button} onPress={() => isPlaying ? sound.pauseAsync() : sound.playAsync()}>
							{
								isPlaying
									? <Icon name="pause" size={23} color={theme.primaryLight} />
									: <Icon name="play" size={23} color={theme.primaryLight} />
							}
						</TouchableOpacity>
						<TouchableOpacity style={styles.button} onPress={() => nextSong(config, sound)}>
							<Icon name="step-forward" size={23} color={theme.primaryLight} />
						</TouchableOpacity>
					</View>
					<View style={{ width: '100%', height: 1, backgroundColor: theme.primaryLight, marginTop: 20 }} >
						<View style={{ width: `${(timer.current / timer.total) * 100}%`, height: 1, backgroundColor: theme.primaryTouch }} />
					</View>
					<View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 10 }}>
						<Text style={{ color: theme.primaryLight, fontSize: 13 }}>{secondToTime(timer.current)}</Text>
						<Text style={{ color: theme.primaryLight, fontSize: 13 }}>{secondToTime(timer.total)}</Text>
					</View>
				</View>
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
		height: Dimensions.get('window').width * 0.80,
		width: Dimensions.get('window').width * 0.80,
		maxWidth: 350,
		maxHeight: 350,
		borderRadius: 10,
		marginTop: 100,
	}
}

export default PlayerBox;