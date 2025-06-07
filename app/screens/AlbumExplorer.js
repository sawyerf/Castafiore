import React from 'react';
import { Text, StyleSheet } from 'react-native';
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
const SIZES = [20, 50, 100, 200, 500];

const AlbumExplorer = () => {
	const insets = useSafeAreaInsets();
	const theme = React.useContext(ThemeContext)
	const navigation = useNavigation();
	const [type, setType] = React.useState('newest');
	const [parSize, setParSize] = React.useState(20);

	const [albums] = useCachedAndApi([], 'getAlbumList2', { type, size: parSize }, (json, setData) => {
		setData(json?.albumList2?.album || []);
	}, [type, parSize])

	const renderItem = React.useCallback(({ item }) => (
		<ExplorerItem
			item={item}
			title={item.name || item.album}
			subTitle={`${item.artist} - ${item.year}`}
			onPress={() => navigation.navigate('Album', item)}
			iconError="album"
			isFavorited={item.starred}
		/>
	), [navigation])

	return (
		<>
			<LegendList
				data={albums}
				keyExtractor={(item, index) => item.id || index.toString()}
				style={mainStyles.mainContainer(theme)}
				contentContainerStyle={[mainStyles.contentMainContainer(insets, false)]}
				waitForInitialLayout={false}
				recycleItems={true}
				ListHeaderComponent={
					<>
						<PresHeaderIcon
							title="Albums"
							subTitle="Explore"
							icon="book"
						/>

						<Text style={styles.titleSelector(theme)}>Type</Text>
						<Selector current={type} items={TYPES} setData={setType} />

						<Text style={styles.titleSelector(theme)}>Size</Text>
						<Selector current={parSize} items={SIZES} setData={setParSize} />
					</>
				}
				renderItem={renderItem}
			/>
		</>
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
});

export default AlbumExplorer;