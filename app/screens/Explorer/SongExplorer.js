import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { LegendList } from '@legendapp/list'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { useTheme } from '~/contexts/theme'
import { getApiNetworkFirst } from '~/utils/api'
import { useConfig } from '~/contexts/config'
import SongItem from '~/components/item/SongItem'
import mainStyles from '~/styles/main'
import PresHeaderIcon from '~/components/PresHeaderIcon'
import size from '~/styles/size'
import logger from '~/utils/logger'

const PAGE_SIZE = 100

const SongExplorer = () => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const theme = useTheme()
	const config = useConfig()
	const [songs, setSongs] = React.useState([])
	const [offset, setOffset] = React.useState(0)
	const [isLoading, setIsLoading] = React.useState(false)

	React.useEffect(() => {
		setIsLoading(true)
		getApiNetworkFirst(config, 'search3', {
			query: '',
			size: PAGE_SIZE,
			songOffset: offset,
			songCount: PAGE_SIZE,
			albumOffset: 0,
			albumCount: 0,
			artistOffset: 0,
			artistCount: 0,
		})
			.then(json => {
				setIsLoading(false)
				const newSongs = json?.searchResult3?.song || []
				if (newSongs.length === 0) return
				setSongs(prev => [...prev, ...newSongs])
			})
			.catch(error => {
				logger.error('SongExplorer', 'Error fetching songs:', error)
				setIsLoading(false)
			})
	}, [offset])

	const handleEndReached = () => {
		if (songs.length > 0 && songs.length % PAGE_SIZE === 0) {
			setOffset(songs.length)
		}
	}

	const renderItem = React.useCallback(({ item, index }) => (
		<SongItem
			song={item}
			queue={songs}
			index={index}
			isFavorited={item.starred}
			style={{
				paddingHorizontal: 20,
			}}
		/>
	), [songs])


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
		if (!songs.length || songs.length % PAGE_SIZE !== 0) return null
		if (!isLoading) return null

		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="small" color={theme.primaryTouch} />
			</View>
		)
	}

	return (
		<LegendList
			data={songs}
			keyExtractor={(_, index) => index}
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={[mainStyles.contentMainContainer(insets, false), { minHeight: 60 * songs.length + 410 }]}
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
				<PresHeaderIcon
					title={t("Songs")}
					subTitle={t("Explore")}
					icon="music"
				/>
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

export default SongExplorer