import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import theme from '~/utils/theme';
import { ConfigContext } from '~/contexts/config';
import SongsList from '~/components/SongsList';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import RandomButton from '~/components/button/RandomButton';
import BackButton from '~/components/button/BackButton';

const Favorited = ({ navigation, route }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)

	return (
		<ScrollView
			vertical={true}
			style={{
				...mainStyles.mainContainer(insets),
				paddingTop: 0,
			}}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}>
			<BackButton />
			<View
				style={styles.cover}
			>
				<Icon name="heart" size={100} color={theme.primaryTouch} />
			</View>
			<View style={presStyles.headerContainer}>
				<View style={{ flex: 1 }}>
					<Text style={presStyles.title}><Icon name="heart" size={23} color={theme.primaryTouch} /> Favorited</Text>
					<Text style={presStyles.subTitle}>{route.params.favorited?.length || 0} songs</Text>
				</View>
				<RandomButton songList={route.params.favorited} />
			</View>
			<SongsList songs={route.params.favorited} config={config} />
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