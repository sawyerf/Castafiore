import React from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
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

	const ItemComponent = React.memo(function Item({ item, index }) {
		return (
			<Pressable
				style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.album])}
				key={index}
				onPress={() => onPress(item)}>
				<ImageError
					style={styles.albumCover(type)}
					source={{
						uri: urlCover(config, item),
					}}
					iconError={['artist', 'artist_all'].includes(type) ? 'user' : 'music'}
				/>
				<Text numberOfLines={1} style={styles.titleAlbum(theme)}>{item.name || item.album }</Text>
				<Text numberOfLines={1} style={styles.artist(theme)}>{item.artist}</Text>
			</Pressable>
		)
	})

	return (
		<FlatList
			vertical={true}
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets, true)}
			columnWrapperStyle={{
				gap: 10,
				paddingHorizontal: 20,
			}}
			numColumns={2}
			ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
			ListHeaderComponent={() => <Header title={title} />}
			data={list}
			keyExtractor={(item, index) => index}
			renderItem={({ item, index }) => (
				<ItemComponent item={item} index={index} />
			)}
		/>
	);
}

const styles = StyleSheet.create({
	album: {
		flex: 1,
		maxWidth: "50%",
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