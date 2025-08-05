import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { LegendList } from '@legendapp/list'

import { ConfigContext } from '~/contexts/config'
import { getCachedAndApi } from '~/utils/api'
import { ThemeContext } from '~/contexts/theme'
import size from '~/styles/size'
import Header from '~/components/Header'
import mainStyles from '~/styles/main'
import ExplorerItem from '~/components/item/ExplorerItem'

const ShowAll = ({ navigation, route: { params: { section } } }) => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const [list, setList] = React.useState([])

	React.useEffect(() => {
		getList()
	}, [section.type, section.query])

	const getList = async () => {
		let nquery = section.query || ''

		if (section.type == 'album') nquery += '&size=' + 100
		getCachedAndApi(config, section.path, nquery, (json) => section.getInfo(json, setList))
	}

	const onPress = React.useCallback((item) => {
		if (section.type === 'album') return navigation.navigate('Album', item)
		if (section.type === 'album_star') return navigation.navigate('Album', item)
		if (section.type === 'artist') return navigation.navigate('Artist', { id: item.id, name: item.name })
		if (section.type === 'artist_all') return navigation.navigate('Artist', { id: item.id, name: item.name })
	}, [section.type])

	const renderItem = React.useCallback(({ item }) => (
		<ExplorerItem
			item={item}
			onPress={() => onPress(item)}
			title={item.name || item.album || item.title}
			subTitle={item.artist || `${item.albumCount} ${t('albums')}`}
			borderRadius={section.type === 'artist' || section.type === 'artist_all' ? size.radius.circle : 2}
			isFavorited={item.starred}
		/>
	), [onPress])

	return (
		<LegendList
			vertical={true}
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={[mainStyles.contentMainContainer(insets, true), { minHeight: 80 * list.length + 100 + 80 }]}
			ListHeaderComponent={() => <Header title={t(`homeSection.${section.title}`)} />}
			data={list}
			keyExtractor={(item, index) => index}
			renderItem={renderItem}
		/>
	)
}

export default ShowAll