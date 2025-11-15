import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/url';
import CustomFlat from '~/components/lists/CustomFlat';
import ImageError from '~/components/ImageError';
import mainStyles from '~/styles/main';
import OptionsArtists from '~/components/options/OptionsArtists';
import size from '~/styles/size';

const HorizontalArtists = ({ artists, onPress = () => { } }) => {
	const navigation = useNavigation();
	const theme = React.useContext(ThemeContext)
	const config = React.useContext(ConfigContext)
	const [indexOptions, setIndexOptions] = React.useState(-1)

	const renderItem = React.useCallback(({ item, index }) => (
		<Pressable
			style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.artist])}
			onPress={() => {
				onPress(item)
				navigation.push('Artist', { id: item.id, name: item.name })
			}}
			delayLongPress={200}
			onLongPress={() => setIndexOptions(index)}
			onContextMenu={(ev) => {
				ev.preventDefault()
				setIndexOptions(index)
			}}
		>
			<ImageError
				style={[styles.artistCover, { backgroundColor: theme.secondaryBack }]}
				source={{ uri: urlCover(config, item) }}
				iconError='user'
			/>
			<Text numberOfLines={1} style={{ color: theme.primaryText, fontSize: size.text.medium, marginBottom: 2, width: 100, textAlign: 'center' }}>{item.name}</Text>
		</Pressable>
	), [theme, config, onPress]);

	return (
		<>
			<CustomFlat
				data={artists}
				renderItem={renderItem}
				widthItem={size.image.medium + 10}
			/>

			<OptionsArtists
				artists={artists}
				indexOptions={indexOptions}
				setIndexOptions={setIndexOptions}
			/>
		</>
	)
}

const styles = StyleSheet.create({
	artist: {
		flexDirection: 'column',
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