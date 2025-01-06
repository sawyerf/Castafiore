import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ThemeContext } from '~/contexts/theme';
import CustomFlat from '~/components/lists/CustomFlat';
import size from '~/styles/size';
import mainStyles from '~/styles/main';

const HorizontalGenres = ({ genres }) => {
	const navigation = useNavigation();
	const theme = React.useContext(ThemeContext)

	return (
		<CustomFlat
			style={styles.genreList}
			contentContainerStyle={styles.scrollContainer}
			data={genres}
			renderItem={({ item }) => (
				<Pressable
					style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.genreBox(theme)])}
					key={item?.value}
					onPress={() => navigation.navigate('Genre', { genre: item })}>
					<Text numberOfLines={1} style={styles.genreText(theme)}>{item.value}</Text>
				</Pressable>
			)}
		/>
	)
}

const styles = StyleSheet.create({
	genreList: {
		width: '100%',
	},
	scrollContainer: {
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
		fontSize: size.text.large,
		fontWeight: 'bold',
	}),
})

export default HorizontalGenres;