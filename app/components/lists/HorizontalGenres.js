import React from 'react';
import { Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import theme from '~/utils/theme';

const HorizontalGenres = ({ config, genres }) => {
	const navigation = useNavigation();

	return (
		<ScrollView
			horizontal={true}
			style={styles.genreList}
			contentContainerStyle={styles.scrollContainer}
			showsHorizontalScrollIndicator={false}>
			{genres?.map((genre) => (
				<TouchableOpacity
					style={styles.genreBox}
					key={genre?.value}
					onPress={() => navigation.navigate('Genre', { genre })}>
					<Text numberOfLines={1} style={styles.genreText}>{genre.value}</Text>
				</TouchableOpacity >
			))}
		</ScrollView>
	)
}

const styles = {
	genreList: {
		width: '100%',
	},
	scrollContainer: {
		height: '100%',
		height: 55 * 2 + 10,
		paddingStart: 20,
		paddingEnd: 20,
		flexDirection: 'column',
		flexWrap: 'wrap',
		columnGap: 10,
		rowGap: 10,
	},
	genreBox: {
		height: 55,
		paddingHorizontal: 40,
		backgroundColor: theme.primaryTouch,
		justifyContent: 'center',
		alignItems: 'center',
	},
	genreText: {
		color: theme.primaryLight,
		fontSize: 20,
		fontWeight: 'bold',
	},
}

export default HorizontalGenres;