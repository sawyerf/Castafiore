import React from 'react';
import { Text, View, TextInput, Image, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import theme from '~/utils/theme';
import { SoundContext, playSong } from '~/utils/playSong';
import { urlCover, getApi } from '~/utils/api';
import FavoritedButton from './button/FavoritedButton';

const SongsList = ({ config, songs, isIndex = false, listToPlay = null }) => {
	const sound = React.useContext(SoundContext)

	return (
		<View style={{
			flexDirection: 'column',
			paddingRight: 10,
		}}>
			{songs?.map((song, index) => (
				<TouchableOpacity style={styles.song} key={song.id} onPress={() => playSong(config, sound, listToPlay ? listToPlay : songs, index)}>
					<Image
						style={styles.albumCover}
						source={{
							uri: urlCover(config, song.albumId, 300),
						}}
					/>
					<View style={{ flex: 1, flexDirection: 'column' }}>
						<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: 16, marginBottom: 2 }}>{(isIndex && song.track !== undefined) ? `${song.track}. ` : null}{song.title}</Text>
						<Text numberOfLines={1} style={{ color: theme.secondaryLight }}>{song.artist}</Text>
					</View>
					<FavoritedButton id={song.id} isFavorited={song?.starred} config={config} style={{ marginRight: 10, padding: 5, paddingStart: 10 }} />
				</TouchableOpacity>
			))}
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