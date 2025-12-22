import React from 'react'
import { Linking } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

import { useConfig } from '~/contexts/config'
import { useSettings, useSetSettings } from '~/contexts/settings'
import { getApi } from '~/utils/api'
import { urlCover } from '~/utils/url'
import size from '~/styles/size'
import OptionsPopup from '~/components/popup/OptionsPopup'

const OptionsPlayer = ({ song, isOpen, setIsOpen, closePlayer }) => {
	const { t } = useTranslation()
	const settings = useSettings()
	const setSettings = useSetSettings()
	const navigation = useNavigation()
	const config = useConfig()
	const refOption = React.useRef()

	const goToArtist = () => {
		if (song.artists?.length > 1) {
			refOption.current.setVirtualOptions([
				{
					name: t('Go to artist'),
				},
				...song.artists.map((artist) => ({
					name: artist.name,
					image: urlCover(config, artist, 100),
					borderRadius: size.radius.circle,
					onPress: () => {
						navigation.navigate('Artist', { id: artist.id, name: artist.name })
						refOption.current.close()
						closePlayer()
					}
				}))
			])
		} else {
			navigation.navigate('Artist', { id: song.artistId, name: song.artist })
			refOption.current.close()
			closePlayer()
		}
	}

	const goToAlbum = () => {
		navigation.navigate('Album', { id: song.albumId, name: song.album, artist: song.artist, artistId: song.artistId })
		refOption.current.close()
		closePlayer()
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
		getApi(config, 'updatePlaylist', { playlistId: playlist.id, songIdToAdd: song.id })
			.then(() => {
				refOption.current.close()
			})
			.catch(() => { })
	}

	if (!song || !isOpen) return null
	return (
		<OptionsPopup
			ref={refOption}
			visible={isOpen}
			close={() => {
				refOption.current.clearVirtualOptions()
				setIsOpen(false)
			}}
			item={isOpen ? song : null}
			options={[
				{
					name: t('Go to artist'),
					icon: 'user',
					onPress: goToArtist,
					hidden: song.isLiveStream
				},
				{
					name: t('Go to album'),
					icon: 'folder-open',
					onPress: goToAlbum,
					hidden: song.isLiveStream
				},
				{
					name: t('Add to playlist'),
					icon: 'plus',
					onPress: openAddToPlaylist,
					hidden: song.isLiveStream
				},
				{
					name: t('Open home page'),
					icon: 'home',
					onPress: () => {
						refOption.current.close()
						Linking.openURL(song.homePageUrl)
					},
					hidden: !song.homePageUrl
				},
				{
					name: t(settings.repeatQueue ? 'Disable repeat queue' : 'Enable repeat queue'),
					icon: 'repeat',
					onPress: () => {
						setSettings({ ...settings, repeatQueue: !settings.repeatQueue })
						refOption.current.close()
					}
				},
				{
					name: t('Info'),
					icon: 'info',
					onPress: () => {
						navigation.navigate('Info', { info: song })
						refOption.current.close()
						closePlayer()
					},
				}
			]} />
	)
}

export default OptionsPlayer