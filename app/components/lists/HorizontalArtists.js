import React from 'react';
import { Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ThemeContext } from '~/contexts/theme';
import { ConfigContext } from '~/contexts/config';
import { urlCover } from '~/utils/api';
import CustomFlat from '~/components/lists/CustomFlat';

const HorizontalArtists = ({ artists, onPress = () => { } }) => {
	const theme = React.useContext(ThemeContext)
	const navigation = useNavigation();
	const config = React.useContext(ConfigContext)

	return (
		<CustomFlat
			data={artists}
			renderItem={({ item }) => (
				<TouchableOpacity style={styles.artist} key={item.id} onPress={() => {
					onPress(item)
					navigation.navigate('Artist', { artist: item })
				}} >
					<Image
						style={styles.artistCover}
						source={{
							uri: urlCover(config, item.id),
						}}
					/>
					<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: 16, marginBottom: 2, width: 100, textAlign: 'center' }}>{item.name}</Text>
				</TouchableOpacity>
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
		height: 100,
		width: 100,
		marginBottom: 10,
		borderRadius: 50,
	},
})

export default HorizontalArtists;