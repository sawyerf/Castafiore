import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/contexts/config';
import { getCachedAndApi } from '~/utils/api';
import { ThemeContext } from '~/contexts/theme';
import { getPathByType, setListByType } from '~/contexts/settings';
import Header from '~/components/Header';
import mainStyles from '~/styles/main';
import AllItem from '../components/item/AllItem';

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
						<AllItem
							key={index}
							item={item}
							type={type}
							onPress={onPress}
						/>
					))}
			</View>
		</ScrollView>
	);
}

export default ShowAll;