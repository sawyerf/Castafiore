import React from 'react'
import { View } from 'react-native'
import { LegendList } from '@legendapp/list'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { useTheme } from '~/contexts/theme'
import { useSettings } from '~/contexts/settings'
import mainStyles from '~/styles/main'
import PresHeaderIcon from '~/components/PresHeaderIcon'
import LBAlbumItem from '~/components/item/LBAlbumItem'
import logger from '~/utils/logger'

const AlbumExplorer = () => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const theme = useTheme()
	const settings = useSettings()
	const [albums, setAlbums] = React.useState([])

	React.useEffect(() => {
		fetch(`https://api.listenbrainz.org/1/user/${encodeURIComponent(settings.listenBrainzUser)}/fresh_releases`, { mode: 'cors' })
			.then(response => response.json())
			.then(data => {
				if (data.error) return
				if (!data?.payload?.releases?.length) return
				let lastDate = ''
				setAlbums(data.payload.releases
					.reverse()
					.filter((item) => ['Album', 'Single', 'EP'].includes(item.release_group_primary_type))
					.map((item) => {
						if (lastDate !== item.release_date) {
							lastDate = item.release_date
							return [
								item.release_date,
								item,
							]
						}
						return item
					})
					.flat() || [])
			})
			.catch((error) => logger.error('FreshReleases', error))
	}, [settings.listenBrainzUser])

	const renderItem = React.useCallback(({ item }) => (
		<LBAlbumItem item={item} />
	), [])

	return (
		<LegendList
			data={albums}
			keyExtractor={(item, index) => index}
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={[mainStyles.contentMainContainer(insets, false)]}
			waitForInitialLayout={false}
			recycleItems={true}
			// estimatedItemSize={80}
			ListHeaderComponent={
				<View style={{ flex: 1 }}>
					<PresHeaderIcon
						title={t("Fresh releases")}
						subTitle="ListenBrainz"
						icon="bell-o"
					/>
				</View>
			}
			renderItem={renderItem}
		/>
	)
}

export default AlbumExplorer