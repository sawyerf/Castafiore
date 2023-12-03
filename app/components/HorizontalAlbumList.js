import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView, Touchable, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import theme from '../utils/theme';

const HorizontalAlbumList = ({ config, title, type }) => {
	const [albums, setAlbums] = React.useState();
	const navigation = useNavigation();

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
					style={{ textDecoration: 'bold' }}
					color={theme.secondaryTouch}>
				</Button>
			</View>
			<ScrollView horizontal={true} style={styles.albumList}>
				{albums?.map((album) => {
					return (
						<TouchableOpacity
							style={styles.album}
							key={album.id}
							onPress={() => navigation.navigate('Album', { album: album })}>
							<Image
								style={styles.albumCover}
								source={{
									uri: config.url + '/rest/getCoverArt?id=' + album.coverArt + '&' + config.query,
								}}
							/>
							<Text numberOfLines={1} style={styles.titleAlbum}>{album.name}</Text>
							<Text numberOfLines={1} style={styles.artist}>{album.artist}</Text>
						</TouchableOpacity >
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
		color: theme.primaryLight,
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
		color: theme.primaryLight,
		fontSize: 14,
		width: 160,
		marginBottom: 3,
		marginTop: 3,
	},
	artist: {
		color: theme.secondaryLight,
		fontSize: 14,
		width: 160,
	},
}

export default HorizontalAlbumList;