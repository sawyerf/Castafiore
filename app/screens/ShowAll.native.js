import React from 'react';
import { View, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/contexts/config';
import { getCachedAndApi } from '~/utils/api';
import { ThemeContext } from '~/contexts/theme';
import { getPathByType, setListByType } from '~/contexts/settings';
import Header from '~/components/Header';
import mainStyles from '~/styles/main';
import AllItem from '~/components/item/AllItem';

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

	const onPress = React.useCallback((item) => {
		if (type === 'album') return navigation.navigate('Album', item)
		if (type === 'album_star') return navigation.navigate('Album', item)
		if (type === 'artist') return navigation.navigate('Artist', { id: item.id, name: item.name })
		if (type === 'artist_all') return navigation.navigate('Artist', { id: item.id, name: item.name })
	}, [navigation, type]);

	const ItemComponent = React.memo(AllItem)

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
			renderItem={({ item }) => (
				<ItemComponent item={item} type={type} onPress={onPress} />
			)}
		/>
	);
}

export default ShowAll;