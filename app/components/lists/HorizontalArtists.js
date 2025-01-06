import React from 'react';
import { Text, Image, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ThemeContext } from '~/contexts/theme';
import { ConfigContext } from '~/contexts/config';
import { urlCover } from '~/utils/api';
import CustomFlat from '~/components/lists/CustomFlat';
import size from '~/styles/size';
import mainStyles from '~/styles/main';

const HorizontalArtists = ({ artists, onPress = () => { } }) => {
	const theme = React.useContext(ThemeContext)
	const navigation = useNavigation();
	const config = React.useContext(ConfigContext)

	return (
		<CustomFlat
			data={artists}
			renderItem={({ item }) => (
				<Pressable style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.artist])} key={item.id} onPress={() => {
					onPress(item)
					navigation.navigate('Artist', { artist: item })
				}} >
					<Image
						style={styles.artistCover}
						source={{
							uri: urlCover(config, item.id),
						}}
					/>
					<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: size.text.medium, marginBottom: 2, width: 100, textAlign: 'center' }}>{item.name}</Text>
				</Pressable>
			)}
		/>
	)
}

const styles = StyleSheet.create({
	artist: {
		flexDirection: 'collumn',
		alignItems: 'center',
	},
	artistCover: {
		height: size.image.medium,
		width: size.image.medium,
		marginBottom: 10,
		borderRadius: size.radius.circle,
	},
})

export default HorizontalArtists;