import React from 'react';
import { Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import CustomScroll from '~/components/lists/CustomScroll';

const HorizontalArtists = ({ config, artists }) => {
	const theme = React.useContext(ThemeContext)
	const navigation = useNavigation();

	return (
		<CustomScroll
			data={artists}
			renderItem={({ item }) => (
				<TouchableOpacity style={styles.artist} key={item.id} onPress={() => navigation.navigate('Artist', { artist: item })} >
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

const styles = {
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
}

export default HorizontalArtists;