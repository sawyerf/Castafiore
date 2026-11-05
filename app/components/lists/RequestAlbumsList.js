import React from 'react'
import { Text, StyleSheet, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { useTheme } from '~/contexts/theme'
import CustomFlat from '~/components/lists/CustomFlat'
import ImageError from '~/components/ImageError'
import mainStyles from '~/styles/main'
import size from '~/styles/size'

/** Albums from the full catalogue, via moderato-service. Opens the album to get its songs. */
const RequestAlbumsList = ({ albums }) => {
	const navigation = useNavigation()
	const theme = useTheme()

	const renderItem = React.useCallback(({ item }) => (
		<Pressable
			style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.album])}
			onPress={() => navigation.navigate('CatalogAlbum', { album: item })}
		>
			<ImageError
				style={[styles.albumCover, { backgroundColor: theme.secondaryBack }]}
				source={{ uri: item.coverUrl }}
			/>
			<Text numberOfLines={1} style={styles.title(theme)}>{item.title}</Text>
			<Text numberOfLines={1} style={styles.artist(theme)}>{item.artist}</Text>
		</Pressable>
	), [theme, navigation])

	return (
		<CustomFlat
			data={albums}
			renderItem={renderItem}
			widthItem={size.image.large + 10}
		/>
	)
}

const styles = StyleSheet.create({
	album: {
		width: size.image.large,
		alignItems: 'center',
	},
	albumCover: {
		width: size.image.large,
		height: size.image.large,
		marginBottom: 6,
	},
	title: (theme) => ({
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

export default RequestAlbumsList
