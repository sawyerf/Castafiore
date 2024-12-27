import React from 'react';
import { Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import OptionsPopup from '~/components/popup/OptionsPopup';
import InfoPopup from '~/components/popup/InfoPopup';
import CustomScroll from '~/components/lists/CustomScroll';

const HorizontalAlbums = ({ config, albums }) => {
	const theme = React.useContext(ThemeContext)
	const navigation = useNavigation();
	const [indexOptions, setIndexOptions] = React.useState(-1)
	const [infoAlbum, setInfoAlbum] = React.useState(null)

	return (
		<>
			<CustomScroll
				data={albums}
				renderItem={({ item, index }) => (
					<TouchableOpacity
						style={styles.album}
						key={item.id}
						onLongPress={() => setIndexOptions(index)}
						delayLongPress={200}
						onPress={() => navigation.navigate('Album', { album: item })}>
						<Image
							style={styles.albumCover}
							source={{
								uri: urlCover(config, item.id),
							}}
						/>
						<Text numberOfLines={1} style={styles.titleAlbum(theme)}>{item.name}</Text>
						<Text numberOfLines={1} style={{ ...styles.artist(theme) }}>{item.artist}</Text>
					</TouchableOpacity >
				)} />

			<InfoPopup info={infoAlbum} close={() => setInfoAlbum(null)} />
			<OptionsPopup
				visible={indexOptions >= 0}
				close={() => { setIndexOptions(-1) }}
				options={[
					{
						name: 'Info',
						icon: 'info',
						onPress: () => {
							setIndexOptions(-1)
							setInfoAlbum(albums[indexOptions])
						}
					}
				]}
			/>
		</>
	)
}

const styles = {
	album: {
		width: 160,
		height: 210,
		alignItems: 'center',
	},
	albumCover: {
		width: 160,
		height: 160,
		marginBottom: 6,
	},
	titleAlbum: (theme) => ({
		color: theme.primaryLight,
		fontSize: 14,
		width: 160,
		marginBottom: 3,
		marginTop: 3,
	}),
	artist: theme => ({
		color: theme.secondaryLight,
		fontSize: 14,
		width: 160,
	}),
}

export default HorizontalAlbums;