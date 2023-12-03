import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView, Touchable, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import theme from '../utils/theme';
import { playSong } from '../utils/playSong';

const SongsList = ({ config, songs }) => {
	return (
		<View style={{
			flexDirection: 'column',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingRight: 10,
		}}>
			{songs?.map((song) => {
				return (
					<TouchableOpacity style={styles.song} key={song.id} onPress={() => playSong(config.url + '/rest/download?id=' + song.id + '&' + config.query)}>
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