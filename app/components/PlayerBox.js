import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../utils/theme';
import { SoundContext } from '../utils/playSong';
import Icon from 'react-native-vector-icons/FontAwesome';

const PlayerBox = () => {
	const insets = useSafeAreaInsets();
	const sound = React.useContext(SoundContext)
	const [isPlaying, setIsPlaying] = React.useState(false)

	// get play or pause icon
	React.useEffect(() => {
		sound.setOnPlaybackStatusUpdate((playbackStatus) => {
			// console.log(playbackStatus)
			setIsPlaying(playbackStatus.isPlaying)
		})
	}, [])

	return (
		<View style={{
			position: 'absolute',
			bottom: insets.bottom + 53,
			left: 0,

			flexDirection: 'row',
			backgroundColor: theme.secondaryDark,
			padding: 10,
			margin: 10,
			borderRadius: 10,
		}}>
			<View style={styles.boxPlayerImage}>
				<Image
					style={styles.boxPlayerImage}
					source={{
						uri: 'https://i.scdn.co/image/ab67616d0000b2736d59695e16cdf5e16d423e63',
					}}
				/>
			</View>
			<View style={styles.boxPlayerText}>
				<Text style={{ color: theme.primaryLight, flex: 1 }} numberOfLines={1}>Song Title</Text>
				<Text style={{ color: theme.secondaryLight, flex: 1 }} numberOfLines={1}>Artist</Text>
			</View>
			<View style={styles.boxPlayerButton}>
				<TouchableOpacity
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
	boxPlayer: {
	},
	boxPlayerImage: {
		flex: 0,
		height: 40,
		width: 40,
		marginRight: 10,
		borderRadius: 4,
	},
	boxPlayerText: {
		flex: 1,
	},
	boxPlayerButton: {
		flex: 0,
		flexDirection: 'row',
	},

}

export default PlayerBox;