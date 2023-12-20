import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView, Touchable, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

import theme from '../utils/theme';
import { SoundContext, playSong } from '../utils/playSong';
import { urlCover } from '../utils/api';

const VerticalPlaylist = ({ config, playlists }) => {
	const navigation = useNavigation();

	return (
		<>
			{
				playlists.map((playlist) => {
					return (
						<TouchableOpacity style={styles.favoritedSong} key={playlist.id} onPress={() => navigation.navigate('Playlist', {playlist: playlist})}>
							<Image
								style={styles.albumCover}
								source={{
									uri: urlCover(config, playlist.id, 100),
								}}
							/>
							<View style={{ flex: 1, flexDirection: 'column' }}>
								<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: 16, marginBottom: 2 }}>{playlist.name}</Text>
								<Text numberOfLines={1} style={{ color: theme.secondaryLight }}>{(playlist.duration / 60) | 1} minutes</Text>
							</View>
						</TouchableOpacity>
					)
				})
			}
		</>
	)
}

const styles = {
	favoritedSong: {
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

export default VerticalPlaylist;