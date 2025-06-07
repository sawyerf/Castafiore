import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ThemeContext } from '~/contexts/theme';
import SongsList from '~/components/lists/SongsList';
import mainStyles from '~/styles/main';
import RandomButton from '~/components/button/RandomButton';
import PresHeaderIcon from '~/components/PresHeaderIcon';
import size from '~/styles/size';

const Favorited = ({ route: { params } }) => {
	const insets = useSafeAreaInsets();
	const theme = React.useContext(ThemeContext)

	return (
		<ScrollView
			vertical={true}
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets, false)}>
			<PresHeaderIcon
				title={<>
					<Icon name="heart" size={size.icon.small} color={theme.primaryTouch} /> Favorited
				</>}
				subTitle={`${params?.favorited?.length || 0} songs`}
				icon="heart"
			>
				<RandomButton songList={params.favorited} />
			</PresHeaderIcon>
			<SongsList songs={params.favorited} />
		</ScrollView>
	)
}

export default Favorited;