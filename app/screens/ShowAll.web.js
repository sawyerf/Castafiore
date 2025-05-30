import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/contexts/config';
import { getCachedAndApi } from '~/utils/api';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import { getPathByType, setListByType } from '~/contexts/settings';
import ImageError from '~/components/ImageError';
import Header from '~/components/Header';
import mainStyles from '~/styles/main';
import size from '~/styles/size';


const ShowAll = ({ navigation, route: { params: { type, query, title } } }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext);
	const theme = React.useContext(ThemeContext);
	const [list, setList] = React.useState([]);

	React.useEffect(() => {
		getList();
	}, [type, query])

	const getList = async () => {
		const path = getPathByType(type)
		let nquery = query ? query : ''

		if (type == 'album') nquery += '&size=' + 100
		getCachedAndApi(config, path, nquery, (json) => {
			setListByType(json, type, setList);
		})
	}

	const onPress = (item) => {
		if (type === 'album') return navigation.navigate('Album', item)
		if (type === 'album_star') return navigation.navigate('Album', item)
		if (type === 'artist') return navigation.navigate('Artist', { id: item.id, name: item.name })
		if (type === 'artist_all') return navigation.navigate('Artist', { id: item.id, name: item.name })
	}

	// I try to use FlatList instead of ScrollView but it glitched and numColumns can't be useState
	// in doc it says that Flatlist is not compatible with flexWrap
	return (
		<ScrollView
			vertical={true}
			style={mainStyles.mainContainer(theme)}
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
							style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.album])}
							key={index}
							onPress={() => onPress(item)}>
							<ImageError
								style={[styles.albumCover(type), { backgroundColor: theme.secondaryBack }]}
								source={{
									uri: urlCover(config, item.id),
								}}
								iconError={['artist', 'artist_all'].includes(type) ? 'user' : 'music'}
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
	album: {
		minWidth: size.image.large,
		maxWidth: 245,
	},
	albumCover: (type) => ({
		width: "100%",
		aspectRatio: 1,
		marginBottom: 6,
		borderRadius: ['artist', 'artist_all'].includes(type) ? size.radius.circle : 0,
	}),
	titleAlbum: (theme) => ({
		color: theme.primaryText,
		fontSize: size.text.small,
		width: '100%',
		marginBottom: 3,
		marginTop: 3,
	}),
	artist: theme => ({
		color: theme.secondaryText,
		fontSize: size.text.small,
		width: '100%',
	}),
})

export default ShowAll;