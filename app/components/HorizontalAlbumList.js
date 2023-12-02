import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView } from 'react-native';

const HorizontalAlbumList = ({ config, title, type, navigation }) => {
	const [albums, setAlbums] = React.useState([]);

	const getAlbumList = async () => {
		fetch(config.url + '/rest/getAlbumList?f=json&type=' + type + '&' + config.query)
			.then((response) => response.json())
			.then((json) => {
				setAlbums(json['subsonic-response'].albumList.album)
			})
	}

	React.useEffect(() => {
		getAlbumList()
	}, [])

	return (
		<View>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					paddingRight: 10,
				}}>
				<Text style={styles.subTitle}>{title}</Text>
				<Button
					title={'>'}
					color={'white'}>
				</Button>
			</View>
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
		width: 160,
		height: 210,
		alignItems: 'center',
	},
	albumCover: {
		width: 160,
		height: 160,
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