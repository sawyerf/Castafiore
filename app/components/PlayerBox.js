import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import { SoundContext, nextSong } from '../utils/playSong';
import { getConfig } from '../utils/config';
import theme from '../utils/theme';

const PlayerBox = () => {
	const insets = useSafeAreaInsets();
	const sound = React.useContext(SoundContext)
	const [isPlaying, setIsPlaying] = React.useState(false)
	const [config, setConfig] = React.useState({});

	// get play or pause icon
	React.useEffect(() => {
		getConfig()
			.then((config) => {
				setConfig(config)
			})
		sound.setOnPlaybackStatusUpdate((playbackStatus) => {
			setIsPlaying(playbackStatus.isPlaying)
			if (playbackStatus.didJustFinish) {
				nextSong(sound)
			}
		})
	}, [])

	return (
		<View style={{
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
						uri: config?.url ? `${config.url}/rest/getCoverArt?id=${sound?.songInfo?.coverArt}&size=100&${config.query}` : null,
					}}
				/>
			</View>
			<View style={styles.boxPlayerText}>
				<Text style={{ color: theme.primaryLight, flex: 1 }} numberOfLines={1}>{sound?.songInfo?.title ? sound.songInfo.title : 'Song title'}</Text>
				<Text style={{ color: theme.secondaryLight, flex: 1 }} numberOfLines={1}>{sound?.songInfo?.artist ? sound.songInfo.artist : 'Artist'}</Text>
			</View>
			<View style={styles.boxPlayerButton}>
				<TouchableOpacity
					onPress={() => nextSong(sound)}
					style={{ justifyContent: 'center', marginRight: 10 }}>
					<Icon name="step-forward" size={23} color={theme.primaryTouch} />
				</TouchableOpacity>
				<TouchableOpacity onPress={() => isPlaying ? sound.pauseAsync() : sound.playAsync()}
					style={{ justifyContent: 'center', marginRight: 10 }}>
					{
						isPlaying
							? <Icon name="pause" size={23} color={theme.primaryTouch} />
							: <Icon name="play" size={23} color={theme.primaryTouch} />
					}
				</TouchableOpacity>
			</View>
		</View>
	)
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

}

export default PlayerBox;