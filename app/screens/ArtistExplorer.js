import React from 'react';
import { Text, SectionList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useCachedAndApi } from '~/utils/api';
import { ThemeContext } from '~/contexts/theme';
import mainStyles from '~/styles/main';
import PresHeaderIcon from '~/components/PresHeaderIcon';
import ExplorerItem from '../components/item/ExplorerItem';
import size from '~/styles/size';

const ArtistExplorer = () => {
	const insets = useSafeAreaInsets();
	const theme = React.useContext(ThemeContext)
	const navigation = useNavigation();

	const [artists] = useCachedAndApi([], 'getArtists', null, (json, setData) => {
		setData(json?.artists?.index.map(item => ({
			title: item.name,
			data: item.artist
		})) || []);
	})

	const [favorited] = useCachedAndApi([], 'getStarred2', null, (json, setData) => {
		setData(json?.starred2?.artist || []);
	}, []);

	const isFavorited = React.useCallback((id) => {
		return favorited.some(fav => fav.id === id);
	}, [favorited]);

	return (
		<>
			<SectionList
				sections={artists}
				keyExtractor={(item, index) => item.id || index.toString()}
				style={mainStyles.mainContainer(theme)}
				contentContainerStyle={[mainStyles.contentMainContainer(insets, false)]}
				maxToRenderPerBatch={20}
				ListHeaderComponent={
					<PresHeaderIcon
						title="Artists"
						subTitle="Explore"
						icon="group"
					/>
				}
				renderSectionHeader={({ section }) => (
					<Text style={[mainStyles.titleSection(theme), {
						marginTop: 10,
						marginBottom: 10,
						marginHorizontal: 20,
					}]}>{section.title}</Text>
				)}
				renderItem={({ item }) => (
					<ExplorerItem
						item={item}
						title={item.name}
						subTitle={`${item.albumCount} albums`}
						onPress={() => navigation.navigate('Artist', { id: item.id, name: item.name })}
						borderRadius={size.radius.circle}
						iconError="group"
						isFavorited={isFavorited(item.id)}
					/>
				)}
			/>
		</>
	);
}

export default ArtistExplorer;