import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LegendList } from "@legendapp/list"

import { ThemeContext } from '~/contexts/theme';
import mainStyles from '~/styles/main';
import OptionsSongsList from '~/components/options/OptionsSongsList';
import Header from '~/components/Header';
import SongItem from '~/components/item/SongItem';

const Songs = ({ route: { params } }) => {
	const insets = useSafeAreaInsets();
	const theme = React.useContext(ThemeContext)
	const [indexOptions, setIndexOptions] = React.useState(-1);

	const renderItem = React.useCallback(({ item, index }) => (
		<SongItem
			song={item}
			queue={params.songs || []}
			index={index}
			setIndexOptions={setIndexOptions}
			style={{
				paddingHorizontal: 20,
			}}
		/>
	), [params.songs]);

	return (
		<>
			<LegendList
				data={params.songs || []}
				keyExtractor={(item, index) => index}
				style={mainStyles.mainContainer(theme)}
				contentContainerStyle={mainStyles.contentMainContainer(insets, true)}
				waitForInitialLayout={false}
				recycleItems={true}
				estimatedItemSize={60}
				ListHeaderComponent={<Header title={params.title} />}
				renderItem={renderItem}
			/>
			<OptionsSongsList
				songs={params.songs || []}
				indexOptions={indexOptions}
				setIndexOptions={setIndexOptions}
			/>
		</>
	)
}

export default Songs;