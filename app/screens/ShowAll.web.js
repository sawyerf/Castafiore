import React from 'react';
import { View, Text, ScrollView, Pressable, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import { getCachedAndApi } from '~/utils/api';
import mainStyles from '~/styles/main';
import { urlCover } from '~/utils/api';
import Header from '~/components/Header';


const ShowAll = ({ navigation, route: { params: { type, query, title } } }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext);
	const theme = React.useContext(ThemeContext);
	const [list, setList] = React.useState([]);

	React.useEffect(() => {
		getList();
	}, [type, query])

	const getPath = () => {
		if (type === 'album') return 'getAlbumList'
		if (type === 'artist') return 'getStarred'
		return type
	}

	const getList = async () => {
		const path = getPath()
		let nquery = query ? query : ''

		if (type == 'album') nquery += '&size=' + 100
		getCachedAndApi(config, path, nquery, (json) => {
			if (type == 'album') return setList(json?.albumList?.album)
			if (type == 'artist') return setList(json?.starred?.artist)
		})
	}

	// I try to use FlatList instead of ScrollView but it glitched and numColumns can't be useState
	// in doc it says that Flatlist is not compatible with flexWrap
	return (
		<ScrollView
			vertical={true}
			style={mainStyles.mainContainer(insets, theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<Header title={title} />
			<View
				style={{
					marginTop: 30,
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
					paddingStart: 20,
					paddingEnd: 20,
					columnGap: 10,
					rowGap: 13,
				}}>
				{
					list.map((item, index) => (
						<Pressable
							style={styles.album}
							key={index}
							onPress={() => navigation.navigate('Album', { album: item })}>
							<Image
								style={styles.albumCover(type)}
								source={{
									uri: urlCover(config, item.id),
								}}
							/>
							<Text numberOfLines={1} style={styles.titleAlbum(theme)}>{item.name}</Text>
							<Text numberOfLines={1} style={styles.artist(theme)}>{item.artist}</Text>
						</Pressable>
					))}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	album: ({ pressed }) => ({
		minWidth: 160,
		maxWidth: 245,
		opacity: pressed ? 0.5 : 1,
	}),
	albumCover: (type) => ({
		width: "100%",
		aspectRatio: 1,
		marginBottom: 6,
		borderRadius: type === 'artist' ? 500 : 0,
	}),
	titleAlbum: (theme) => ({
		color: theme.primaryLight,
		fontSize: 14,
		width: 160,
		marginBottom: 3,
		marginTop: 3,
	}),
	artist: theme => ({
		color: theme.secondaryLight,
		fontSize: 14,
		width: 160,
	}),
})

export default ShowAll;