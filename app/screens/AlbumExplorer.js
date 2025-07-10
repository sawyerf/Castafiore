import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LegendList } from '@legendapp/list';

import { ThemeContext } from '~/contexts/theme';
import { useCachedAndApi } from '~/utils/api';
import mainStyles from '~/styles/main';
import PresHeaderIcon from '~/components/PresHeaderIcon';
import Selector from '~/components/Selector';
import size from '~/styles/size';
import ExplorerItem from '~/components/item/ExplorerItem';

const TYPES = ['newest', 'highest', 'frequent', 'recent', 'starred', 'random'];
const PAGE_SIZE = 20;

const AlbumExplorer = () => {
	const insets = useSafeAreaInsets();
	const theme = React.useContext(ThemeContext)
	const navigation = useNavigation();
	const [type, setType] = React.useState('newest');
	const [offset, setOffset] = React.useState(0);

	const handleAlbumsFetch = async (json, setData) => {
		const newAlbums = json?.albumList2?.album || [];
		setData(prev => [...prev, ...newAlbums]);
	}

	const [albums] = useCachedAndApi(
		[],
		'getAlbumList2', 
		{ type, size: PAGE_SIZE, offset },
		handleAlbumsFetch,
		[type, offset]
	)

	const handleEndReached = () => {
		if (albums.length > 0 && albums.length % PAGE_SIZE === 0) {
			setOffset(albums.length);
		}
	};

	const renderItem = React.useCallback(({ item }) => (
		<ExplorerItem
			item={item}
			title={item.name || item.album || item.title}
			subTitle={`${item.artist || 'Unknown Artist'} · ${item.year || ''}`}
			onPress={() => navigation.navigate('Album', item)}
			isFavorited={item.starred}
		/>
	), [])


	const renderActivityIndicator = () => (
		<View style={styles.loadingContainer}>
			<ActivityIndicator size="small" color={theme.primaryTouch} />
		</View>
	);

	const renderFooter = () => {
		if (albums.length === 0 || albums.length % PAGE_SIZE !== 0) return null;
		
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="small" color={theme.primaryTouch} />
			</View>
		);
	};

	// Reset albums when type changes
	React.useEffect(() => {
		albums.length = 0;
		setOffset(0);
	}, [type]);

	return (
		<LegendList
			data={albums}
			keyExtractor={(_, index) => `${index}`}
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={[mainStyles.contentMainContainer(insets, false), { minHeight: 80 * albums.length + 678 }]}
			waitForInitialLayout={false}
			recycleItems={true}
			estimatedItemSize={80}
			maintainVisibleContentPosition={{
				minIndexForVisible: 0,
				itemVisiblePercentThreshold: 50,
			}}
			onEndReached={handleEndReached}
			onEndReachedThreshold={0.1}
			ListHeaderComponent={
				<View style={{ flex: 1}}>
					<PresHeaderIcon
						title="Albums"
						subTitle="Explore"
						icon="book"
					/>

					<Text style={styles.titleSelector(theme)}>Type</Text>
					<Selector current={type} items={TYPES} setData={setType} />
				</View>
			}
			ListFooterComponent={renderFooter}
			renderItem={renderItem}
			ListEmptyComponent={renderActivityIndicator}
		/>
	);
}

const styles = StyleSheet.create({
	titleSelector: (theme) => ({
		color: theme.primaryText,
		fontSize: size.text.medium,
		fontWeight: 'bold',
		marginHorizontal: 20,
		marginBottom: 10,
	}),
	loadingContainer: {
		paddingVertical: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default AlbumExplorer;