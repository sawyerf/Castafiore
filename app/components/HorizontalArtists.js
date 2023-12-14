import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView, Touchable, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SoundContext, playSong } from '../utils/playSong';

import theme from '../utils/theme';

const HorizontalArtists = ({ config, artists }) => {
	const sound = React.useContext(SoundContext)

	return (
		<ScrollView horizontal={true} style={{
			flexDirection: 'row',
			// alignItems: 'center',
			paddingEnd: 10,
			paddingStart: 10,
		}}>
			{artists?.map((artist) => {
				return (
					<TouchableOpacity style={styles.artist} key={artist.id} >
						<Image
							style={styles.artistCover}
							source={{
								uri: config.url + '/rest/getCoverArt?id=' + artist.coverArt + '&size=300&' + config.query,
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