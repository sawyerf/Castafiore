import React from 'react'
import { ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ConfigContext } from '~/contexts/config'
import { useCachedAndApi } from '~/utils/api'
import { ThemeContext } from '~/contexts/theme'
import { urlCover } from '~/utils/api'
import FavoritedButton from '~/components/button/FavoritedButton'
import mainStyles from '~/styles/main'
import presStyles from '~/styles/pres'
import RandomButton from '~/components/button/RandomButton'
import SongsList from '~/components/lists/SongsList'
import size from '~/styles/size'
import PresHeader from '~/components/PresHeader'
import OptionsMultiArtists from '~/components/options/OptionsMultiArtists'
import OptionsAlbum from '~/components/options/OptionsAlbum'

const Album = ({ navigation, route: { params } }) => {
	const insets = useSafeAreaInsets()
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const [isStarred, setStarred] = React.useState(params.starred || false)
	const [album, setAlbum] = React.useState(null)
	const [isOptArtists, setIsOptArtists] = React.useState(false)
	const [isOptAlbum, setIsOptAlbum] = React.useState(false)

	const [songs] = useCachedAndApi([], 'getAlbum', { id: params.id}, (json, setData) => {
		setStarred(json?.album?.starred)
		setAlbum(json?.album)
		setData(json?.album?.song.sort((a, b) => {
			// sort by discNumber and track
			if (a.discNumber < b.discNumber) return -1
			if (a.discNumber > b.discNumber) return 1
			if (a.track < b.track) return -1
			if (a.track > b.track) return 1
			return 0
		}))
	}, [params.id])

	return (
		<ScrollView
			vertical={true}
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets, false)}>
			<PresHeader
				title={album?.name || album?.album || album?.title || params.name || params.album || params.title}
				subTitle={album?.artist || params.artist || '-'}
				imgSrc={urlCover(config, params)}
				onPressOption={() => setIsOptAlbum(true)}
				onPressTitle={() => {
					if (album?.artists?.length > 1) setIsOptArtists(true)
					else if (album?.artistId && album?.artist) navigation.navigate('Artist', { id: album?.artistId, name: album?.artist })
					else if (params.artistId && params.artist) navigation.navigate('Artist', { id: params.artistId, name: params.artist })
				}}
			>
				<FavoritedButton id={params.id} isFavorited={isStarred} style={[presStyles.button, { paddingEnd: 0 }]} size={size.icon.medium} />
				<RandomButton songList={songs} size={size.icon.medium} />
			</PresHeader>
			<OptionsAlbum
				album={album || params}
				isOpen={isOptAlbum}
				onClose={() => setIsOptAlbum(false)}
			/>
			<OptionsMultiArtists
				artists={album?.artists || params.artists}
				close={() => setIsOptArtists(false)}
				visible={isOptArtists}
			/>
			<SongsList songs={songs} isIndex={true} />
		</ScrollView>
	)
}

export default Album