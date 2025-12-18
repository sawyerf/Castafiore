import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { LegendList } from '@legendapp/list'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { ThemeContext } from '~/contexts/theme'
import { getApiNetworkFirst } from '~/utils/api'
import { ConfigContext } from '~/contexts/config'
import mainStyles from '~/styles/main'
import size from '~/styles/size'
import ExplorerItem from '~/components/item/ExplorerItem'
import logger from '~/utils/logger'
import Header from '~/components/Header'

const PAGE_SIZE = 20

const GenreAlbum = ({ route: { params: { name, albums } } }) => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const theme = React.useContext(ThemeContext)
	const navigation = useNavigation()
	const config = React.useContext(ConfigContext)
	const [items, setItems] = React.useState(albums || [])
	const [offset, setOffset] = React.useState(albums?.length || 0)
	const [isLoading, setIsLoading] = React.useState(false)

	React.useEffect(() => {
		setIsLoading(true)
		getApiNetworkFirst(config, 'getAlbumList2', { type: 'byGenre', genre: name, size: 20, offset })
			.then(json => {
				setIsLoading(false)
				setItems(prev => [...prev, ...(json?.albumList2?.album || [])])
			})
			.catch(error => {
				logger.error('GenreAlbum', 'Error fetching items:', error)
				setIsLoading(false)
			})
	}, [offset])

	const handleEndReached = () => {
		if (items.length > 0 && items.length % PAGE_SIZE === 0) {
			setOffset(items.length)
		}
	}

	const renderItem = React.useCallback(({ item }) => (
		<ExplorerItem
			item={item}
			title={item.name || item.title}
			subTitle={item.artist}
			onPress={() => navigation.navigate('Album', { id: item.id, title: item.title, artist: item.artist })}
			isFavorited={item.starred}
		/>
	), [items, config])


	const renderActivityIndicator = () => {
		if (!isLoading) {
			return (
				<View style={styles.loadingContainer}>
					<Text style={{ color: theme.primaryText, fontSize: size.text.medium }}>{t('No results')}</Text>
				</View>
			)
		}
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="small" color={theme.primaryTouch} />
			</View>
		)
	}

	const renderFooter = () => {
		if (!items.length || items.length % PAGE_SIZE !== 0) return null
		if (!isLoading) return null

		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="small" color={theme.primaryTouch} />
			</View>
		)
	}

	return (
		<LegendList
			data={items}
			keyExtractor={(_, index) => index}
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={[mainStyles.contentMainContainer(insets, false), { minHeight: 80 * items.length + 100 + 80 }]}
			waitForInitialLayout={false}
			recycleItems={true}
			estimatedItemSize={80}
			maintainVisibleContentPosition={{
				minIndexForVisible: 0,
				itemVisiblePercentThreshold: 50,
			}}
			onEndReached={handleEndReached}
			onEndReachedThreshold={0.1}
			ListHeaderComponent={
				<Header title={`${t('Albums')} · ${name}`} />
			}
			ListFooterComponent={renderFooter}
			renderItem={renderItem}
			ListEmptyComponent={renderActivityIndicator}
		/>
	)
}

const styles = StyleSheet.create({
	titleSelector: (theme) => ({
		color: theme.primaryText,
		fontSize: size.text.medium,
		fontWeight: 'bold',
		marginHorizontal: 20,
		marginBottom: 10,
	}),
	loadingContainer: {
		paddingVertical: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
})

export default GenreAlbum