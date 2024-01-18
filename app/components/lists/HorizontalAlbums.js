import React from 'react';
import { Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import theme from '~/utils/theme';
import { urlCover } from '~/utils/api';
import OptionsPopup from '~/components/popup/OptionsPopup';
import InfoPopup from '~/components/popup/InfoPopup';

const HorizontalAlbums = ({ config, albums }) => {
	const navigation = useNavigation();
	const [indexOptions, setIndexOptions] = React.useState(-1)
	const [infoAlbum, setInfoAlbum] = React.useState(null)

	return (
		<ScrollView horizontal={true} style={styles.albumList} showsHorizontalScrollIndicator={false}>
			{albums?.map((album, index) => {
				return (
					<TouchableOpacity
						style={styles.album}
						key={album.id}
						onLongPress={() => setIndexOptions(index)}
						delayLongPress={200}
						onPress={() => navigation.navigate('Album', { album: album })}>
						<Image
							style={styles.albumCover}
							source={{
								uri: urlCover(config, album.id),
							}}
						/>
						<Text numberOfLines={1} style={styles.titleAlbum}>{album.name}</Text>
						<Text numberOfLines={1} style={styles.artist}>{album.artist}</Text>
					</TouchableOpacity >
				)
			})}
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
		</ScrollView>
	)
}

const styles = {
	albumList: {
		width: '100%',
		paddingLeft: 10,
	},
	album: {
		margin: 10,
		width: 160,
		height: 210,
		alignItems: 'center',
	},
	albumCover: {
		width: 160,
		height: 160,
		marginBottom: 6,
	},
	titleAlbum: {
		color: theme.primaryLight,
		fontSize: 14,
		width: 160,
		marginBottom: 3,
		marginTop: 3,
	},
	artist: {
		color: theme.secondaryLight,
		fontSize: 14,
		width: 160,
	},
}

export default HorizontalAlbums;