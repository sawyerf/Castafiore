import React from 'react';
import { Text, View, Image, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import { SoundContext, nextSong, pauseSong, resumeSong } from '~/utils/player';
import { ConfigContext } from '~/utils/config';
import theme from '~/utils/theme';
import mainStyles from '~/styles/main';
import { urlCover } from '~/utils/api';
import IconButton from '~/components/button/IconButton';

const BoxPlayer = ({ isPlaying, fullscreen }) => {
	const sound = React.useContext(SoundContext)
	const config = React.useContext(ConfigContext)
	const insets = useSafeAreaInsets();

	return (
		<TouchableOpacity
			onPress={() => fullscreen.set(true)}
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
					onPress={() => isPlaying ? pauseSong(sound) : resumeSong(sound)}
				/>
			</View>
		</TouchableOpacity>
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

export default BoxPlayer;