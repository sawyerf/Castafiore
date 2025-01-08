import React from 'react';
import { View, Text, Pressable, Image, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/contexts/config';
import { getCachedAndApi } from '~/utils/api';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
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

	const onPress = (item) => {
		if (type === 'album') return navigation.navigate('Album', { album: item })
		if (type === 'artist') return navigation.navigate('Artist', { artist: item })
	}

	const ItemComponent = React.memo(function Item ({ item, index }) {(
		<Pressable
			style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.album])}
			key={index}
			onPress={() => onPress(item)}>
			<Image
				style={styles.albumCover(type)}
				source={{
					uri: urlCover(config, item.id),
				}}
			/>
			<Text numberOfLines={1} style={styles.titleAlbum(theme)}>{item.name}</Text>
			<Text numberOfLines={1} style={styles.artist(theme)}>{item.artist}</Text>
		</Pressable>
	)})

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
		borderRadius: type === 'artist' ? size.radius.circle : 0,
	}),
	titleAlbum: (theme) => ({
		color: theme.primaryLight,
		fontSize: size.text.small,
		width: '100%',
		marginBottom: 3,
		marginTop: 3,
	}),
	artist: theme => ({
		color: theme.secondaryLight,
		fontSize: size.text.small,
		width: '100%',
	}),
})

export default ShowAll;