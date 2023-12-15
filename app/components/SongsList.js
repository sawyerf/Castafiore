import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView, Touchable, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import theme from '../utils/theme';
import { SoundContext, playSong } from '../utils/playSong';

const SongItem = ({ song, config }) => {
	const [star, setStar] = React.useState(song?.starred ? true : false)

	const onPressFavorited = () => {
		fetch(`${config.url}/rest/${star ? 'unstar' : 'star'}?id=${song.id}&${config.query}`)
			.then((response) => response.json())
			.then((json) => {
				if (json['subsonic-response'] && !json['subsonic-response']?.error) {
					setStar(!star)
				} else {
					console.log('star:', json['subsonic-response']?.error)
				}
			})
	}

	return (
		<>
			<Image
				style={styles.albumCover}
				source={{
					uri: config?.url ? `${config.url}/rest/getCoverArt?id=${song.coverArt}&size=100&${config.query}` : null,
				}}
			/>
			<View style={{ flex: 1, flexDirection: 'column' }}>
				<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: 16, marginBottom: 2 }}>{song.title}</Text>
				<Text numberOfLines={1} style={{ color: theme.secondaryLight }}>{song.artist}</Text>
			</View>
			<TouchableOpacity onPress={() => onPressFavorited()} style={{ marginRight: 10, padding: 5, paddingStart: 10 }}>
				{star
					? <Icon name="heart" size={23} color={theme.primaryTouch} /> :
					<Icon name="heart-o" size={23} color={theme.primaryTouch} />}
			</TouchableOpacity>
		</>
	)
}

const SongsList = ({ config, songs }) => {
	const sound = React.useContext(SoundContext)

	return (
		<View style={{
			flexDirection: 'column',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingRight: 10,
		}}>
			{songs?.map((song, index) => (
				<TouchableOpacity style={styles.song} key={song.id} onPress={() => playSong(sound, songs, index)}>
					<SongItem song={song} index={index} key={index} config={config} />
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