import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView, Touchable, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import theme from '../utils/theme';
import { SoundContext, playSong } from '../utils/playSong';

const SongsList = ({ config, songs }) => {
	const sound = React.useContext(SoundContext)

	return (
		<View style={{
			flexDirection: 'column',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingRight: 10,
		}}>
			{songs?.map((song) => {
				return (
					<TouchableOpacity style={styles.song} key={song.id} onPress={() => playSong(sound, config.url + '/rest/download?id=' + song.id + '&' + config.query)}>
						<Image
							style={styles.albumCover}
							source={{
								uri: config.url + '/rest/getCoverArt?id=' + song.coverArt + '&size=100&' + config.query,
							}}
						/>
						<View style={{ flex: 1, flexDirection: 'column' }}>
							<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: 16, marginBottom: 2 }}>{song.title}</Text>
							<Text numberOfLines={1} style={{ color: theme.secondaryLight }}>{song.artist}</Text>
						</View>
						<TouchableOpacity onPress={() => console.log('Pressed heart')} style={{ marginRight: 10, padding: 5, paddingStart: 10 }}>
							{song?.starred
								? <Icon name="heart" size={23} color={theme.primaryTouch} /> :
								<Icon name="heart-o" size={23} color={theme.primaryTouch} />}
						</TouchableOpacity>
					</TouchableOpacity>
				)
			})}
		</View>
	)
}

const styles = {
	song: {
		flexDirection: 'row',
		alignItems: 'center',
		marginStart: 20,
		marginBottom: 10,
	},
	albumCover: {
		height: 50,
		width: 50,
		marginRight: 10,
		borderRadius: 4,
	},
}

export default SongsList;