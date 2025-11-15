import React from 'react'
import { Text, StyleSheet, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { ConfigContext } from '~/contexts/config'
import { ThemeContext } from '~/contexts/theme'
import { urlCover } from '~/utils/url'
import ImageError from '~/components/ImageError'
import CustomFlat from '~/components/lists/CustomFlat'
import mainStyles from '~/styles/main'
import OptionsAlbums from '~/components/options/OptionsAlbums'
import size from '~/styles/size'

const HorizontalAlbums = ({ albums, year = false, onPress = () => { } }) => {
	const navigation = useNavigation()
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const [indexOptions, setIndexOptions] = React.useState(-1)

	const renderItem = React.useCallback(({ item, index }) => (
		<Pressable
			style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.album])}
			onPress={() => {
				onPress(item)
				navigation.navigate('Album', item)
			}}
			delayLongPress={200}
			onLongPress={() => setIndexOptions(index)}
			onContextMenu={(ev) => {
				ev.preventDefault()
				setIndexOptions(index)
			}}
		>
			<ImageError
				style={[styles.albumCover, { backgroundColor: theme.secondaryBack }]}
				source={{ uri: urlCover(config, item) }}
			/>
			<Text numberOfLines={1} style={styles.titleAlbum(theme)}>{item.name || item.album || item.title}</Text>
			<Text numberOfLines={1} style={styles.artist(theme)}>{year ? item.year : (item.artist || '-')}</Text>
		</Pressable>
	), [theme, config, onPress])

	return (
		<>
			<CustomFlat
				data={albums}
				renderItem={renderItem}
				widthItem={size.image.large + 10}
			/>
			<OptionsAlbums
				albums={albums}
				indexOptions={indexOptions}
				setIndexOptions={setIndexOptions}
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
		color: theme.primaryText,
		fontSize: size.text.small,
		textAlign: 'left',
		width: size.image.large,
		marginBottom: 3,
		marginTop: 3,
	}),
	artist: theme => ({
		color: theme.secondaryText,
		fontSize: size.text.small,
		width: size.image.large,
		textAlign: 'left',
	}),
})

export default HorizontalAlbums