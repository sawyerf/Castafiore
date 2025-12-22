import React from 'react'
import { Platform, Share } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

import { useConfig } from '~/contexts/config'
import { getApi, getApiNetworkFirst } from '~/utils/api'
import { urlStream } from '~/utils/url'
import { isSongCached } from '~/utils/cache'
import { playSong, addToQueue } from '~/utils/player'
import { useSettings } from '~/contexts/settings'
import { useSong, useSongDispatch } from '~/contexts/song'
import { urlCover } from '~/utils/url'
import OptionsPopup from '~/components/popup/OptionsPopup'
import size from '~/styles/size'

const OptionsSongsList = ({ songs, indexOptions, setIndexOptions, onUpdate = () => { }, idPlaylist = null }) => {
	const { t } = useTranslation()
	const navigation = useNavigation()
	const song = useSong()
	const songDispatch = useSongDispatch()
	const config = useConfig()
	const settings = useSettings()
	const refOption = React.useRef()
	const [isCached, setIsCached] = React.useState(false)

	React.useEffect(() => {
		if (indexOptions < 0) return
		isSongCached(config, songs[indexOptions]?.id, settings.streamFormat, settings.maxBitrate)
			.then((cached) => {
				setIsCached(cached ? true : false)
			})
	}, [indexOptions])

	const playSimilarSongs = () => {
		getApiNetworkFirst(config, 'getSimilarSongs', `id=${songs[indexOptions].id}&count=50`)
			.then((json) => {
				if (!json.similarSongs?.song) {
					playSong(config, songDispatch, [songs[indexOptions]], 0)
				} else {
					if (settings.playSeedFirst) playSong(config, songDispatch, [songs[indexOptions], ...json.similarSongs.song], 0)
					else playSong(config, songDispatch, json.similarSongs.song, 0)
				}
			})
			.catch(() => { })
		refOption.current.close()
	}

	const addQueue = () => {
		if (song.queue) addToQueue(songDispatch, songs[indexOptions])
		else playSong(config, songDispatch, [songs[indexOptions]], 0)
		refOption.current.close()
	}

	const playNext = () => {
		if (song.queue) {
			addToQueue(songDispatch, songs[indexOptions], song.index + 1)
		} else {
			playSong(config, songDispatch, [songs[indexOptions]], 0)
		}
		refOption.current.close()
	}

	const artistOpt = (artist) => ({
		name: artist.name,
		image: urlCover(config, artist, 100),
		borderRadius: size.radius.circle,
		onPress: () => {
			navigation.navigate('Artist', { id: artist.id, name: artist.name })
			refOption.current.close()
		}
	})

	const goToArtist = () => {
		if (songs[indexOptions].artists?.length > 1) {
			refOption.current.setVirtualOptions([
				{
					name: t('Go to artist'),
				},
				// ...(songs[indexOptions].albumArtists?.filter((artist) => songs[indexOptions].artists.findIndex((a) => a.id === artist.id)).map(artistOpt) || []),
				...songs[indexOptions].artists.map(artistOpt)
			])
		} else {
			navigation.navigate('Artist', { id: songs[indexOptions].artistId, name: songs[indexOptions].artist })
			refOption.current.close()
		}
	}

	const goToAlbum = () => {
		navigation.navigate('Album', { id: songs[indexOptions].albumId, name: songs[indexOptions].album, artist: songs[indexOptions].artist, artistId: songs[indexOptions].artistId })
		refOption.current.close()
	}

	const openAddToPlaylist = () => {
		getApi(config, 'getPlaylists')
			.then((json) => {
				if (!json.playlists?.playlist) return

				refOption.current.setVirtualOptions([
					{
						name: t('Add to playlist'),
					},
					...json.playlists.playlist.map((playlist) => ({
						name: playlist.name,
						image: urlCover(config, playlist, 100),
						onPress: () => addToPlaylist(playlist)
					}))
				]
				)
			})
			.catch(() => { })
	}

	const addToPlaylist = (playlist) => {
		getApi(config, 'updatePlaylist', { playlistId: playlist.id, songIdToAdd: songs[indexOptions].id })
			.then(() => {
				refOption.current.close()
				onUpdate()
			})
			.catch(() => { })
	}

	const removeFromPlaylist = () => {
		getApi(config, 'updatePlaylist', { playlistId: idPlaylist, songIndexToRemove: songs[indexOptions].index })
			.then(() => {
				refOption.current.close()
				onUpdate()
			})
			.catch(() => { })
	}

	const downloadSong = async () => {
		refOption.current.close()
		fetch(urlStream(config, songs[indexOptions].id))
			.then((res) => res.blob())
			.then((data) => {
				const a = document.createElement('a')
				a.download = `${songs[indexOptions].artist} - ${songs[indexOptions].title}.mp3`
				a.href = URL.createObjectURL(data)
				a.addEventListener('click', () => {
					setTimeout(() => URL.revokeObjectURL(a.href), 1 * 1000)
				})
				a.click()
			})
			.catch(() => { })
	}

	const shareSong = () => {
		getApi(config, 'createShare', { id: songs[indexOptions].id })
			.then((json) => {
				if (json.shares.share.length > 0) {
					if (Platform.OS === 'web') navigator.clipboard.writeText(json.shares.share[0].url)
					else Share.share({ message: json.shares.share[0].url })
				}
			})
			.catch(() => { })
		refOption.current.close()
	}

	const playOnlyCached = async () => {
		const cachedList = []
		let indexPlay = 0

		for (let index = 0; index < songs.length; index++) {
			const cached = await isSongCached(config, songs[index].id, settings.streamFormat, settings.maxBitrate)
			if (index === indexOptions) indexPlay = cachedList.length
			if (cached) cachedList.push(songs[index])
		}
		playSong(config, songDispatch, cachedList, indexPlay)
		refOption.current.close()
	}

	if (indexOptions < 0) return null
	return (
		<OptionsPopup
			ref={refOption}
			visible={indexOptions >= 0}
			close={() => {
				refOption.current.clearVirtualOptions()
				setIndexOptions(-1)
			}}
			item={indexOptions >= 0 ? songs[indexOptions] : null}
			options={[
				{
					name: t('Play similar songs'),
					icon: 'play',
					onPress: playSimilarSongs
				},
				{
					name: t('Play only cached songs'),
					icon: 'cloud-download',
					onPress: playOnlyCached,
					hidden: !isCached
				},
				{
					name: t('Play next'),
					icon: 'indent',
					onPress: playNext
				},
				{
					name: t('Add to queue'),
					icon: 'list-ul',
					onPress: addQueue
				},
				{
					name: t('Go to artist'),
					icon: 'user',
					onPress: goToArtist
				},
				{
					name: t('Go to album'),
					icon: 'folder-open',
					onPress: goToAlbum
				},
				{
					name: t('Add to playlist'),
					icon: 'plus',
					onPress: openAddToPlaylist
				},
				{
					name: t('Remove from playlist'),
					icon: 'trash-o',
					onPress: removeFromPlaylist,
					hidden: !idPlaylist
				},
				{
					name: t('Download'),
					icon: 'download',
					onPress: downloadSong,
					hidden: Platform.OS !== 'web'
				},
				{
					name: t('Share'),
					icon: 'share',
					onPress: shareSong
				},
				{
					name: t('Info'),
					icon: 'info',
					onPress: () => {
						refOption.current.close()
						refOption.current.showInfo(songs[indexOptions])
					}
				},
			]} />
	)
}

export default OptionsSongsList