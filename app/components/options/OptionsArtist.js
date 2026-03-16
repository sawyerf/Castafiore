import React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking } from 'react-native'

import { useConfig } from '~/contexts/config'
import { getApiCacheFirst } from '~/utils/api'
import { playSong } from '~/utils/player'
import { useSongDispatch } from '~/contexts/song'
import OptionsPopup from '~/components/popup/OptionsPopup'

const OptionsArtist = ({ artist, artistInfo = {}, isOption, setIsOption }) => {
	const songDispatch = useSongDispatch()
	const config = useConfig()
	const { t } = useTranslation()
	const refOption = React.useRef()

	const playSimilarSongs = () => {
		getApiCacheFirst(config, 'getSimilarSongs', { id: artist.id, count: 50 })
			.then((json) => {
				if (json.similarSongs?.song) {
					playSong(config, songDispatch, json.similarSongs.song, 0)
				}
			})
			.catch(() => { })
		refOption.current.close()
	}

	const playTopSongs = () => {
		getApiCacheFirst(config, 'getTopSongs', { artist: artist.name, count: 50 })
			.then((json) => {
				if (json.topSongs?.song) {
					playSong(config, songDispatch, json.topSongs.song, 0)
				}
			})
			.catch(() => { })
		refOption.current.close()
	}

	const playSongInPlaylist = async () => {
		const inPlaylist = []

		const jsonPlaylists = await getApiCacheFirst(config, 'getPlaylists')
			.catch(() => null)
		if (!jsonPlaylists?.playlists?.playlist) {
			refOption.current.close()
			return
		}
		for (const playlist of jsonPlaylists.playlists.playlist) {
			const jsonPlaylist = await getApiCacheFirst(config, 'getPlaylist', { id: playlist.id })
				.catch(() => null)
			if (!jsonPlaylist?.playlist?.entry) continue
			jsonPlaylist.playlist.entry.forEach(song => {
				if (song.artistId === artist.id && !inPlaylist.find(s => s.id === song.id)) {
					inPlaylist.push(song)
				}
			})
		}
		if (inPlaylist.length > 0) playSong(config, songDispatch, inPlaylist, 0)
		refOption.current.close()
	}

	if (!artist) return null
	return (
		<OptionsPopup
			ref={refOption}
			visible={isOption}
			close={() => { setIsOption(false) }}
			item={isOption ? artist : null}
			options={[
				{
					name: t('Play similar songs'),
					icon: 'play',
					onPress: playSimilarSongs
				},
				{
					name: t('Play top songs'),
					icon: 'arrow-up',
					onPress: playTopSongs
				},
				{
					name: t('Play songs in playlists'),
					icon: 'book',
					onPress: playSongInPlaylist
				},
				{
					name: t('Open in MusicBrainz'),
					icon: 'external-link',
					onPress: () => {
						Linking.openURL('https://musicbrainz.org/artist/' + artistInfo.musicBrainzId)
						refOption.current.close()
					},
					hidden: !artistInfo?.musicBrainzId
				},
				{
					name: t('Open in Last.fm'),
					icon: 'external-link',
					onPress: () => {
						Linking.openURL(artistInfo.lastFmUrl)
						refOption.current.close()
					},
					hidden: !artistInfo?.lastFmUrl
				},
				{
					name: t('Info'),
					icon: 'info',
					onPress: () => {
						refOption.current.showInfo({
							...artist,
							...artistInfo,
						})
						refOption.current.close()
					}
				}
			]}
		/>
	)
}

export default OptionsArtist