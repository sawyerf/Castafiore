import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView } from 'react-native';

const HorizontalAlbumList = ({ config, title, type, navigation }) => {
	const [albums, setAlbums] = React.useState([]);

	const getAlbumList = async () => {
		const res = await fetch(config.url + '/rest/getAlbumList?f=json&type=' + type + '&' + config.query)
		const data = await res.json()
		setAlbums(data['subsonic-response'].albumList.album)
	}

	React.useEffect(() => {
		getAlbumList()
	})

	return (
		<View>
			<Text style={styles.subTitle}>{title}</Text>
			<ScrollView horizontal={true} style={styles.albumList}>
				{albums?.map((album) => {
					return (
						<View
							style={styles.album}
							key={album.id}>
							<Image
								style={styles.albumCover}
								source={{
									uri: config.url + '/rest/getCoverArt?id=' + album.coverArt + '&size=160&' + config.query,
								}}
							/>
							<Text numberOfLines={1} style={styles.titleAlbum}>{album.name}</Text>
							<Text numberOfLines={1} style={styles.artist}>{album.artist}</Text>
						</View>
					)
				})}
			</ScrollView>
		</View>
	)
}

const styles = {
	albumList: {
		width: '100%',
		paddingLeft: 10,
	},
	subTitle: {
		color: 'white',
		fontSize: 25,
		fontWeight: 'bold',
		marginTop: 20,
		marginBottom: 10,
		marginLeft: 20,
	},
	album: {
		margin: 10,
		// backgroundColor: '#1e1e1e',
		width: 160,
		height: 210,
		alignItems: 'center',
		// borderRadius: 10,
	},
	albumCover: {
		width: 160,
		height: 160,
		// borderTopLeftRadius: 10,
		// borderTopRightRadius: 10,
		marginBottom: 6,
	},
	titleAlbum: {
		color: 'white',
		fontSize: 14,
		width: 160,
		marginBottom: 3,
		marginTop: 3,
	},
	artist: {
		color: 'grey',
		fontSize: 14,
		width: 160,
	},
}

export default HorizontalAlbumList;