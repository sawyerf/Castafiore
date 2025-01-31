import React from 'react';
import { Text, View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ThemeContext } from '~/contexts/theme';
import SongsList from '~/components/lists/SongsList';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import RandomButton from '~/components/button/RandomButton';
import BackButton from '~/components/button/BackButton';
import size from '~/styles/size';

const Favorited = ({ route: { params } }) => {
	const insets = useSafeAreaInsets();
	const theme = React.useContext(ThemeContext)

	return (
		<ScrollView
			vertical={true}
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets, false)}>
			<BackButton />
			<View
				style={styles.cover}
			>
				<Icon name="heart" size={100} color={'#cd1921'} />
			</View>
			<View style={presStyles.headerContainer}>
				<View style={{ flex: 1 }}>
					<Text style={presStyles.title(theme)}><Icon name="heart" size={size.icon.small} color={theme.primaryTouch} /> Favorited</Text>
					<Text style={presStyles.subTitle(theme)}>{params.favorited?.length || 0} songs</Text>
				</View>
				<RandomButton songList={params.favorited} />
			</View>
			<SongsList songs={params.favorited} />
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	cover: {
		width: "100%",
		height: 300,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#c68588',
	},
})

export default Favorited;