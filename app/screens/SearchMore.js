import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { LegendList } from '@legendapp/list'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { ThemeContext } from '~/contexts/theme'
import { getApiNetworkFirst } from '~/utils/api'
import { ConfigContext } from '~/contexts/config'
import { playSong } from '~/utils/player'
import { SongDispatchContext } from '~/contexts/song'
import mainStyles from '~/styles/main'
import size from '~/styles/size'
import ExplorerItem from '~/components/item/ExplorerItem'
import logger from '~/utils/logger'
import Header from '~/components/Header'

const PAGE_SIZE = 20

const SearchMore = ({ route: { params: { query, results, type } } }) => {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const theme = React.useContext(ThemeContext)
  const navigation = useNavigation()
  const config = React.useContext(ConfigContext)
  const songDispatch = React.useContext(SongDispatchContext)
  const [items, setItems] = React.useState(results || [])
  const [offset, setOffset] = React.useState(results?.length || 0)
  const [isLoading, setIsLoading] = React.useState(false)

  const getParams = (type) => {
    if (type === 'album') return { query, artistCount: 0, songCount: 0, albumCount: PAGE_SIZE, albumOffset: offset }
    if (type === 'artist') return { query, artistCount: PAGE_SIZE, songCount: 0, albumCount: 0, artistOffset: offset }
    if (type === 'song') return { query, artistCount: 0, songCount: PAGE_SIZE, albumCount: 0, songOffset: offset }
  }

  React.useEffect(() => {
    setIsLoading(true)
    getApiNetworkFirst(config, 'search3', getParams(type))
      .then(json => {
        setIsLoading(false)
        if (type === 'album') {
          setItems(prev => [...prev, ...(json?.searchResult3?.album || [])])
        } else if (type === 'artist') {
          setItems(prev => [...prev, ...(json?.searchResult3?.artist || [])])
        } else if (type === 'song') {
          setItems(prev => [...prev, ...(json?.searchResult3?.song || [])])
        }
      })
      .catch(error => {
        logger.error('SearchMore', 'Error fetching items:', error)
        setIsLoading(false)
      })
  }, [offset])

  const handleEndReached = () => {
    if (items.length > 0 && items.length % PAGE_SIZE === 0) {
      setOffset(items.length)
    }
  }

  const goTo = (item, index) => {
    if (type === 'album') navigation.navigate('Album', item)
    if (type === 'artist') navigation.navigate('Artist', item)
    if (type === 'song') playSong(config, songDispatch, items, index)
  }

  const renderItem = React.useCallback(({ item, index }) => (
    <ExplorerItem
      item={item}
      title={item.name || item.title}
      subTitle={type !== 'artist' ? item.artist : ''}
      onPress={() => goTo(item, index)}
      isFavorited={item.starred}
      borderRadius={type === 'artist' ? size.radius.circle : undefined}
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
      contentContainerStyle={[mainStyles.contentMainContainer(insets, false), { minHeight: 80 * items.length + 410 }]}
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
        <Header title={t("Search")} />
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

export default SearchMore