import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ThemeContext } from '~/contexts/theme';
import { ConfigContext } from '~/contexts/config';
import { urlCover } from '~/utils/api';
import ImageError from '~/components/ImageError';
import CustomFlat from '~/components/lists/CustomFlat';
import OptionsPopup from '~/components/popup/OptionsPopup';
import size from '~/styles/size';
import mainStyles from '~/styles/main';

const HorizontalArtists = ({ artists, onPress = () => { } }) => {
	const navigation = useNavigation();
	const theme = React.useContext(ThemeContext)
	const config = React.useContext(ConfigContext)
	const refOption = React.useRef()
	const [indexOptions, setIndexOptions] = React.useState(-1)

	return (
		<>
			<CustomFlat
				data={artists}
				renderItem={({ item, index }) => (
					<Pressable
						style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.artist])}
						onPress={() => {
							onPress(item)
							navigation.navigate('Artist', { id: item.id, name: item.name })
						}}
						onLongPress={() => setIndexOptions(index)}
						delayLongPress={200}
					>
						<ImageError
							style={[styles.artistCover, { backgroundColor: theme.secondaryBack }]}
							source={{ uri: urlCover(config, item.id) }}
							iconError='user'
						/>
						<Text numberOfLines={1} style={{ color: theme.primaryText, fontSize: size.text.medium, marginBottom: 2, width: 100, textAlign: 'center' }}>{item.name}</Text>
					</Pressable>
				)}
			/>

			<OptionsPopup
				reff={refOption}
				visible={indexOptions >= 0}
				close={() => { setIndexOptions(-1) }}
				item={indexOptions >= 0 ? artists[indexOptions] : null}
				options={[
					{
						name: 'Info',
						icon: 'info',
						onPress: () => {
							refOption.current.showInfo(artists[indexOptions])
							setIndexOptions(-1)
						}
					}
				]}
			/>
		</>
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