import React from 'react';
import { Text, Image, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import { ConfigContext } from '~/contexts/config';
import OptionsPopup from '~/components/popup/OptionsPopup';
import CustomFlat from '~/components/lists/CustomFlat';
import size from '~/styles/size';
import mainStyles from '~/styles/main';

const HorizontalAlbums = ({ albums, year = false, onPress = () => { } }) => {
	const navigation = useNavigation();
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const refOption = React.useRef()
	const [indexOptions, setIndexOptions] = React.useState(-1)

	return (
		<>
			<CustomFlat
				data={albums}
				renderItem={({ item, index }) => (
					<Pressable
						style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.album])}
						key={item.id}
						onLongPress={() => setIndexOptions(index)}
						delayLongPress={200}
						onPress={() => {
							onPress(item)
							navigation.navigate('Album', item)
						}}>
						<Image
							style={[styles.albumCover, { backgroundColor: theme.secondaryDark }]}
							source={{
								uri: urlCover(config, item.id),
							}}
						/>
						<Text numberOfLines={1} style={styles.titleAlbum(theme)}>{item.name}</Text>
						<Text numberOfLines={1} style={styles.artist(theme)}>{year ? item.year : item.artist}</Text>
					</Pressable>
				)} />

			<OptionsPopup
				reff={refOption}
				visible={indexOptions >= 0}
				close={() => { setIndexOptions(-1) }}
				item={indexOptions >= 0 ? albums[indexOptions] : null}
				options={[
					{
						name: 'Go to artist',
						icon: 'user',
						onPress: () => {
							refOption.current.close()
							navigation.navigate('Artist', { id: albums[indexOptions].artistId, name: albums[indexOptions].artist })
						}
					},
					{
						name: 'Info',
						icon: 'info',
						onPress: () => {
							refOption.current.setInfo(albums[indexOptions])
							setIndexOptions(-1)
						}
					}
				]}
			/>
		</>
	)
}

const styles = StyleSheet.create({
	album: {
		width: size.image.large,
		height: 210,
		alignItems: 'center',
	},
	albumCover: {
		width: size.image.large,
		height: size.image.large,
		marginBottom: 6,
	},
	titleAlbum: (theme) => ({
		color: theme.primaryLight,
		fontSize: size.text.small,
		width: size.image.large,
		marginBottom: 3,
		marginTop: 3,
	}),
	artist: theme => ({
		color: theme.secondaryLight,
		fontSize: size.text.small,
		width: size.image.large,
	}),
})

export default HorizontalAlbums;