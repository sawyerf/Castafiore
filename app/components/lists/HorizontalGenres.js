import React from 'react';
import { Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ThemeContext } from '~/contexts/theme';
import CustomScroll from '~/components/lists/CustomScroll';

const HorizontalGenres = ({ config, genres }) => {
	const navigation = useNavigation();
  const theme = React.useContext(ThemeContext)

	return (
		<CustomScroll
			style={styles.genreList}
			contentContainerStyle={styles.scrollContainer}
			>
			{genres?.map((genre) => (
				<TouchableOpacity
					style={styles.genreBox(theme)}
					key={genre?.value}
					onPress={() => navigation.navigate('Genre', { genre })}>
					<Text numberOfLines={1} style={styles.genreText(theme)}>{genre.value}</Text>
				</TouchableOpacity >
			))}
		</CustomScroll>
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
	genreBox: theme => ({
		height: 55,
		paddingHorizontal: 40,
		backgroundColor: theme.primaryTouch,
		justifyContent: 'center',
		alignItems: 'center',
	}),
	genreText: theme => ({
		color: theme.primaryLight,
		fontSize: 20,
		fontWeight: 'bold',
	}),
}

export default HorizontalGenres;