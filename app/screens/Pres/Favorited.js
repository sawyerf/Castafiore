import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LegendList } from "@legendapp/list"
import Icon from 'react-native-vector-icons/FontAwesome';

import { ThemeContext } from '~/contexts/theme';
import mainStyles from '~/styles/main';
import OptionsSongsList from '~/components/options/OptionsSongsList';
import PresHeaderIcon from '~/components/PresHeaderIcon';
import RandomButton from '~/components/button/RandomButton';
import size from '~/styles/size';
import SongItem from '~/components/item/SongItem';

const Favorited = ({ route: { params } }) => {
	const insets = useSafeAreaInsets();
	const theme = React.useContext(ThemeContext)
	const [indexOptions, setIndexOptions] = React.useState(-1);

	const renderItem = React.useCallback(({ item, index }) => (
		<SongItem
			song={item}
			queue={params.favorited}
			index={index}
			setIndexOptions={setIndexOptions}
			style={{
				paddingHorizontal: 20,
			}}
		/>
	), []);

	return (
		<>
			<LegendList
				data={params.favorited}
				keyExtractor={(item, index) => index}
				style={mainStyles.mainContainer(theme)}
				contentContainerStyle={mainStyles.contentMainContainer(insets, false)}
				recycleItems={true}
				waitForInitialLayout={false}
				estimatedItemSize={60}
				ListHeaderComponent={
					<PresHeaderIcon
						title={<>
							<Icon name="heart" size={size.icon.small} color={theme.primaryTouch} /> Favorited
						</>}
						subTitle={`${params?.favorited?.length || 0} songs`}
						icon="heart"
					>
						<RandomButton songList={params.favorited} />
					</PresHeaderIcon>
				}
				renderItem={renderItem}
			/>
			<OptionsSongsList
				songs={params.favorited}
				indexOptions={indexOptions}
				setIndexOptions={setIndexOptions}
			/>
		</>
	)
}

export default Favorited;