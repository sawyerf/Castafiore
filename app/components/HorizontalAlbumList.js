import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView, Touchable, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

import theme from '../utils/theme';
import mainStyles from '../styles/main';
import HorizontalAlbums from './HorizontalAlbums';
import { getApi } from '../utils/api';

const HorizontalAlbumList = ({ config, title, type }) => {
	const [albums, setAlbums] = React.useState();
	const navigation = useNavigation();

	const getAlbumList = async () => {
		getApi(config, 'getAlbumList', `type=${type}`)
			.then((json) => {
				setAlbums(json?.albumList?.album)
			})
			.catch((error) => { })
	}

	React.useEffect(() => {
		if (config.url) getAlbumList()
	}, [config])

	return (
		<View>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					paddingRight: 10,
					marginTop: 20,
					marginBottom: 10,
				}}>
				<Text style={{ ...mainStyles.subTitle, ...mainStyles.stdVerticalMargin }}>{title}</Text>
				<TouchableOpacity
					style={{ textDecoration: 'bold' }}
					color={theme.secondaryTouch}>
					<Icon name="chevron-right" size={20} color={theme.secondaryTouch} />
				</TouchableOpacity>
			</View>
			<HorizontalAlbums config={config} albums={albums} />
		</View>
	)
}

const styles = {
	albumList: {
		width: '100%',
		paddingLeft: 10,
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