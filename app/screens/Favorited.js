import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ThemeContext } from '~/contexts/theme';
import SongsList from '~/components/lists/SongsList';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import RandomButton from '~/components/button/RandomButton';
import BackButton from '~/components/button/BackButton';

const Favorited = ({ route }) => {
	const insets = useSafeAreaInsets();
  const theme = React.useContext(ThemeContext)

	return (
		<ScrollView
			vertical={true}
			style={mainStyles.mainContainer(insets, theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets, false)}>
			<BackButton />
			<View
				style={styles.cover}
			>
				<Icon name="heart" size={100} color={theme.primaryTouch} />
			</View>
			<View style={presStyles.headerContainer}>
				<View style={{ flex: 1 }}>
					<Text style={presStyles.title(theme)}><Icon name="heart" size={23} color={theme.primaryTouch} /> Favorited</Text>
					<Text style={presStyles.subTitle(theme)}>{route.params.favorited?.length || 0} songs</Text>
				</View>
				<RandomButton songList={route.params.favorited} />
			</View>
			<SongsList songs={route.params.favorited} />
		</ScrollView>
	)
}

const styles = {
	cover: {
		width: "100%",
		height: 300,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#c68588',
	},
}

export default Favorited;