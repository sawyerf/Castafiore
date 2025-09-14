import React from 'react';
import { LegendList } from '@legendapp/list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ThemeContext } from '~/contexts/theme';
import mainStyles from '~/styles/main';
import Header from '~/components/Header';
import ExplorerItem from '~/components/item/ExplorerItem';
import OptionsAlbums from '~/components/options/OptionsAlbums';


const AristAlbums = ({ navigation, route: { params: { albums } } }) => {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const theme = React.useContext(ThemeContext);
	const [indexOptions, setIndexOptions] = React.useState(-1);

	const renderItem = React.useCallback(({ item, index }) => (
		<ExplorerItem
			item={item}
			title={item.name || item.album || item.title}
			subTitle={`${item.year || ''}`}
			onPress={() => navigation.navigate('Album', item)}
			onLongPress={() => setIndexOptions(index)}
			isFavorited={item.starred}
		/>
	), [])

	return (
		<>
			<LegendList
				data={albums}
				keyExtractor={(_, index) => index}
				style={mainStyles.mainContainer(theme)}
				contentContainerStyle={[mainStyles.contentMainContainer(insets, true), { minHeight: 80 * albums.length + 100 + 80 }]}
				waitForInitialLayout={false}
				recycleItems={true}
				estimatedItemSize={80}
				maintainVisibleContentPosition={{
					minIndexForVisible: 0,
					itemVisiblePercentThreshold: 50,
				}}
				ListHeaderComponent={<Header title={t('Albums')} />}
				renderItem={renderItem}
			/>
			<OptionsAlbums
				albums={albums}
				indexOptions={indexOptions}
				setIndexOptions={setIndexOptions}
			/>
		</>
	)
}

export default AristAlbums