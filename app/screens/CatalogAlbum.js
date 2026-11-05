import React from 'react'
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import Icon from 'react-native-vector-icons/FontAwesome'

import { useSettings } from '~/contexts/settings'
import { useTheme } from '~/contexts/theme'
import { getCatalogAlbum } from '~/utils/songService'
import Header from '~/components/Header'
import ImageError from '~/components/ImageError'
import mainStyles from '~/styles/main'
import RequestSongsList from '~/components/lists/RequestSongsList'
import size from '~/styles/size'

/** An album from the full catalogue. Songs can be added one by one or all at once. */
const CatalogAlbum = ({ route: { params } }) => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const theme = useTheme()
	const settings = useSettings()
	const [album, setAlbum] = React.useState(params.album)
	const [items, setItems] = React.useState(null)
	const [error, setError] = React.useState(null)
	const getAll = React.useRef(null)

	React.useEffect(() => {
		setItems(null)
		setError(null)
		getCatalogAlbum(settings, params.album.id)
			.then((json) => {
				setAlbum(json.album)
				setItems(json.items)
			})
			.catch((e) => setError(e.message))
	}, [params.album.id])

	const inLibrary = items?.filter((item) => item.cached).length ?? 0
	const details = [
		album.artist,
		album.year,
		items ? t('songService.Album songs', { count: items.length, cached: inLibrary }) : null,
	].filter(Boolean).join(' · ')

	return (
		<ScrollView
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={[mainStyles.contentMainContainer(insets), { paddingBottom: 80 }]}
		>
			<Header title={album.title} marginBottom={20} />
			<View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginHorizontal: 20, marginBottom: 20 }}>
				<ImageError
					style={{ width: size.image.large, height: size.image.large, backgroundColor: theme.secondaryBack }}
					source={{ uri: album.coverUrl }}
				/>
				<View style={{ flex: 1, gap: 6 }}>
					<Text numberOfLines={2} style={{ color: theme.primaryText, fontSize: size.title.small, fontWeight: 'bold' }}>{album.title}</Text>
					<Text numberOfLines={2} style={{ color: theme.secondaryText, fontSize: size.text.medium }}>{details}</Text>
					{items?.length > 0 && (
						<Pressable
							onPress={() => getAll.current?.()}
							style={({ pressed }) => ([mainStyles.opacity({ pressed }), {
								flexDirection: 'row',
								alignItems: 'center',
								alignSelf: 'flex-start',
								gap: 8,
								marginTop: 6,
								paddingVertical: 8,
								paddingHorizontal: 14,
								borderRadius: 20,
								backgroundColor: theme.primaryTouch,
							}])}
						>
							<Icon name={inLibrary === items.length ? 'play' : 'cloud-download'} size={size.icon.tiny} color={theme.innerTouch} />
							<Text style={{ color: theme.innerTouch, fontSize: size.text.medium, fontWeight: 'bold' }}>
								{inLibrary === items.length ? t('songService.Play album') : t('songService.Get album')}
							</Text>
						</Pressable>
					)}
				</View>
			</View>
			{!items && !error && <ActivityIndicator size="large" color={theme.primaryTouch} />}
			{error && <Text style={{ marginHorizontal: 20, color: theme.secondaryText, fontSize: size.text.medium }}>{error}</Text>}
			{items && <RequestSongsList items={items} isIndex getAllRef={getAll} />}
		</ScrollView>
	)
}

export default CatalogAlbum
