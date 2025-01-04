import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ThemeContext } from '~/contexts/theme';
import CustomFlat from '~/components/lists/CustomFlat';

const HorizontalGenres = ({ genres }) => {
	const navigation = useNavigation();
	const theme = React.useContext(ThemeContext)

	return (
		<CustomFlat
			style={styles.genreList}
			contentContainerStyle={styles.scrollContainer}
			data={genres}
			renderItem={({item}) => (
				<TouchableOpacity
					style={styles.genreBox(theme)}
					key={item?.value}
					onPress={() => navigation.navigate('Genre', { genre: item })}>
					<Text numberOfLines={1} style={styles.genreText(theme)}>{item.value}</Text>
				</TouchableOpacity>
			)}
		/>
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
		flex: 1,
		height: 55,
		borderRadius: 3,
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