import React from 'react'
import { LegendList } from "@legendapp/list"
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { useConfig } from '~/contexts/config'
import { useCachedAndApi } from '~/utils/api'
import { urlCover } from '~/utils/url'
import { useSettings } from '~/contexts/settings'
import { useTheme } from '~/contexts/theme'
import { isPlaylistCached } from '~/utils/offlineSync'
import { getSongsCacheSize } from '~/utils/cache'
import { useDownloading } from '~/utils/downloadStatus'
import PresHeader from '~/components/PresHeader'
import mainStyles from '~/styles/main'
import OptionsSongsList from '~/components/options/OptionsSongsList'
import presStyles from '~/styles/pres'
import RandomButton from '~/components/button/RandomButton'
import SongItem from '~/components/item/SongItem'
import OptionsPlaylist from '~/components/options/OptionsPlaylist'

const Playlist = ({ route: { params } }) => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const config = useConfig()
	const theme = useTheme()
	const settings = useSettings()
	const [info, setInfo] = React.useState(null)
	const [indexOptions, setIndexOptions] = React.useState(-1)
	const [isOption, setIsOption] = React.useState(false)
	const [cacheSize, setCacheSize] = React.useState(null)
	const downloading = useDownloading()

	const [songs, refresh] = useCachedAndApi([], 'getPlaylist', `id=${params.playlist.id}`, (json, setData) => {
		setInfo(json?.playlist)
		if (settings.reversePlaylist) setData(json?.playlist?.entry?.map((item, index) => ({ ...item, index })).reverse() || [])
		else setData(json?.playlist?.entry?.map((item, index) => ({ ...item, index })) || [])
	}, [params.playlist.id, settings.reversePlaylist])

	const isCached = isPlaylistCached(settings, params.playlist.id)

	React.useEffect(() => {
		let active = true
		if (!isCached || !songs.length) { setCacheSize(null); return }
		// Recomputed when a download finishes (downloading set changes) so the
		// size grows live while the playlist is being cached.
		getSongsCacheSize(songs.map((song) => song.id), settings.streamFormat)
			.then((bytes) => { if (active) setCacheSize(bytes) })
		return () => { active = false }
	}, [isCached, songs, settings.streamFormat, downloading])

	const subTitle = `${((info?.duration || params?.playlist?.duration) / 60) | 1} ${t('minutes')} · ${info?.songCount || params?.playlist?.songCount} ${t('songs')}`
		+ (cacheSize !== null ? ` · ${(cacheSize / (1024 * 1024)).toFixed(1)} MB` : '')

	const renderItem = React.useCallback(({ item, index }) => (
		<SongItem
			song={item}
			queue={songs}
			index={index}
			setIndexOptions={setIndexOptions}
			style={{
				paddingHorizontal: 20,
			}}
		/>
	), [songs])

	return (
		<>
			<LegendList
				data={songs}
				keyExtractor={(item, index) => index}
				style={mainStyles.mainContainer(theme)}
				contentContainerStyle={[mainStyles.contentMainContainer(insets, false)]}
				recycleItems={true}
				waitForInitialLayout={false}
				estimatedItemSize={60}
				ListHeaderComponent={
					<>
						<PresHeader
							title={info?.name || params.playlist.name}
							subTitle={subTitle}
							imgSrc={urlCover(config, params.playlist)}
							onPressOption={() => {
								setIsOption(true)
							}}
						>
							<RandomButton songList={songs} style={presStyles.button} />
						</PresHeader>
						<OptionsPlaylist
							playlist={info}
							open={isOption}
							onClose={() => setIsOption(false)}
							onRefresh={refresh}
						/>
					</>
				}
				renderItem={renderItem}
			/>
			<OptionsSongsList
				songs={songs}
				onUpdate={refresh}
				indexOptions={indexOptions}
				setIndexOptions={setIndexOptions}
				idPlaylist={params.playlist.id}
			/>
		</>
	)
}

export default Playlist