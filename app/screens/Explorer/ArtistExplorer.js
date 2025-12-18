import React from 'react'
import { View, Text } from 'react-native'
import { LegendList } from '@legendapp/list'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { useTheme } from '~/contexts/theme'
import { useCachedAndApi } from '~/utils/api'
import ExplorerItem from '~/components/item/ExplorerItem'
import mainStyles from '~/styles/main'
import PresHeaderIcon from '~/components/PresHeaderIcon'
import SideBarLetter from '~/components/button/SidebarLetter'
import size from '~/styles/size'

const ArtistExplorer = () => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const theme = useTheme()
	const navigation = useNavigation()
	const [alpha, setAlpha] = React.useState([])
	const refScroll = React.useRef(null)

	const [artists] = useCachedAndApi([], 'getArtists', null, (json, setData) => {
		setAlpha(json?.artists?.index?.map(item => item.name[0].toUpperCase()))
		setData(json?.artists?.index?.map(item => ([
			item.name,
			...item.artist,
		])).flat() || [])
	})

	const [favorited] = useCachedAndApi([], 'getStarred2', null, (json, setData) => {
		setData(json?.starred2?.artist || [])
	}, [])

	const isFavorited = React.useCallback((id) => {
		return favorited.some(fav => fav.id === id)
	}, [favorited])

	const renderItem = React.useCallback(({ item }) => {
		if (typeof item === 'string') return (
			<View style={{
				flex: 1,
				flexDirection: 'row',
				alignItems: 'flex-end',
				gap: 10,
				minHeight: 80,
				paddingBottom: 8,
				marginHorizontal: 20,
			}}>
				<Text style={mainStyles.titleSection(theme)}>{item}</Text>
			</View>
		)
		return (
			<ExplorerItem
				item={item}
				title={item.name}
				subTitle={`${item.albumCount} ${t('albums')}`}
				onPress={() => navigation.navigate('Artist', { id: item.id, name: item.name })}
				borderRadius={size.radius.circle}
				iconError="group"
				isFavorited={isFavorited(item.id)}
			/>
		)
	}, [theme, isFavorited])

	return (
		<>
			<SideBarLetter
				alpha={alpha}
				onPress={(letter) => {
					const index = artists.findIndex(item => typeof item === 'string' && item.startsWith(letter))
					if (index !== -1) {
						refScroll.current.scrollToIndex({ index, animated: false })
					}
				}}
			/>
			<LegendList
				ref={refScroll}
				data={artists}
				keyExtractor={(item, index) => index}
				style={mainStyles.mainContainer(theme)}
				contentContainerStyle={[mainStyles.contentMainContainer(insets, false), { minHeight: 80 * artists.length + 490 }]}
				waitForInitialLayout={false}
				recycleItems={true}
				estimatedItemSize={80}
				ListHeaderComponent={
					<PresHeaderIcon
						title={t("Artists")}
						subTitle={t("Explore")}
						icon="group"
					/>
				}
				renderItem={renderItem}
			/>
		</>
	)
}

export default ArtistExplorer