import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LegendList } from "@legendapp/list"
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ThemeContext } from '~/contexts/theme';
import { useCachedFirst } from '~/utils/api';
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
	const { t } = useTranslation();

	const [favorited] = useCachedFirst(params?.favorited || [], 'getStarred2', null, (json, setData) => {
		setData(json?.starred2?.song || [])
	}, [])

	const renderItem = React.useCallback(({ item, index }) => (
		<SongItem
			song={item}
			queue={favorited}
			index={index}
			setIndexOptions={setIndexOptions}
			style={{
				paddingHorizontal: 20,
			}}
		/>
	), [favorited]);

	return (
		<>
			<LegendList
				data={favorited}
				keyExtractor={(item, index) => index}
				style={mainStyles.mainContainer(theme)}
				contentContainerStyle={mainStyles.contentMainContainer(insets, false)}
				waitForInitialLayout={false}
				recycleItems={true}
				estimatedItemSize={60}
				ListHeaderComponent={
					<PresHeaderIcon
						title={<><Icon name="heart" size={size.icon.small} color={theme.primaryTouch} /> {t('Favorited')}</>}
						subTitle={`${favorited?.length || 0} songs`}
						icon="heart"
					>
						<RandomButton songList={favorited} />
					</PresHeaderIcon>
				}
				renderItem={renderItem}
			/>
			<OptionsSongsList
				songs={favorited}
				indexOptions={indexOptions}
				setIndexOptions={setIndexOptions}
			/>
		</>
	)
}

export default Favorited;