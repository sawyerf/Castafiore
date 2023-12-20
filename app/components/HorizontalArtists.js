import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView, Touchable, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SoundContext, playSong } from '../utils/playSong';
import { useNavigation } from '@react-navigation/native';

import theme from '../utils/theme';
import { urlCover } from '../utils/api';

const HorizontalArtists = ({ config, artists }) => {
	const sound = React.useContext(SoundContext)
	const navigation = useNavigation();

	return (
		<ScrollView horizontal={true} style={{
			flexDirection: 'row',
			// alignItems: 'center',
			paddingEnd: 10,
			paddingStart: 10,
		}}>
			{artists?.map((artist) => {
				return (
					<TouchableOpacity style={styles.artist} key={artist.id} onPress={() => navigation.navigate('Artist', {artist})} >
						<Image
							style={styles.artistCover}
							source={{
								uri: urlCover(config, artist.id),
							}}
						/>
						<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: 16, marginBottom: 2, width: 100, textAlign: 'center' }}>{artist.name}</Text>
					</TouchableOpacity>
				)
			})}
		</ScrollView>
	)
}

const styles = {
	artist: {
		flexDirection: 'collumn',
		alignItems: 'center',
		marginStart: 10,
	},
	artistCover: {
		height: 100,
		width: 100,
		marginBottom: 10,
		borderRadius: 50,
	},
}

export default HorizontalArtists;