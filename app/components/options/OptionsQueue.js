import React from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { ConfigContext } from '~/contexts/config';
import { getApi } from '~/utils/api';
import { SongContext, SongDispatchContext } from '~/contexts/song';
import { urlCover } from '~/utils/api';
import { removeFromQueue } from '~/utils/player';
import size from '~/styles/size';
import OptionsPopup from '~/components/popup/OptionsPopup';

const OptionsQueue = ({ queue, indexOptions, setIndexOptions, closePlayer }) => {
	const { t } = useTranslation();
	const navigation = useNavigation();
	const song = React.useContext(SongContext);
	const songDispatch = React.useContext(SongDispatchContext);
	const config = React.useContext(ConfigContext);
	const refOption = React.useRef();

	const goToArtist = () => {
		if (queue[indexOptions].artists?.length > 1) {
			refOption.current.setVirtualOptions([
				{
					name: t('Go to artist'),
				},
				...queue[indexOptions].artists.map((artist) => ({
					name: artist.name,
					image: urlCover(config, artist, 100),
					borderRadius: size.radius.circle,
					onPress: () => {
						navigation.navigate('Artist', { id: artist.id, name: artist.name })
						refOption.current.close();
						closePlayer()
					}
				}))
			])
		} else {
			navigation.navigate('Artist', { id: queue[indexOptions].artistId, name: queue[indexOptions].artist })
			refOption.current.close()
			closePlayer()
		}
	}

	const goToAlbum = () => {
		navigation.navigate('Album', { id: queue[indexOptions].albumId, name: queue[indexOptions].album, artist: queue[indexOptions].artist, artistId: queue[indexOptions].artistId })
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
				);
			})
			.catch(() => { })
	}

	const addToPlaylist = (playlist) => {
		getApi(config, 'updatePlaylist', `playlistId=${playlist.id}&songIdToAdd=${queue[indexOptions].id}`)
			.then(() => {
				refOption.current.close()
			})
			.catch(() => { })
	}

	const removeFromQueueOpt = () => {
		removeFromQueue(songDispatch, indexOptions)
		refOption.current.close()
	}

	return (
		<OptionsPopup
			ref={refOption}
			visible={indexOptions >= 0}
			close={() => {
				refOption.current.clearVirtualOptions()
				setIndexOptions(-1)
			}}
			item={indexOptions >= 0 ? queue[indexOptions] : null}
			options={[
				{
					name: t('Go to artist'),
					icon: 'user',
					onPress: goToArtist,
					hidden: indexOptions >= 0 && queue[indexOptions].isLiveStream
				},
				{
					name: t('Go to album'),
					icon: 'folder-open',
					onPress: goToAlbum,
					hidden: indexOptions >= 0 && queue[indexOptions].isLiveStream
				},
				{
					name: t('Add to playlist'),
					icon: 'plus',
					onPress: openAddToPlaylist,
					hidden: indexOptions >= 0 && queue[indexOptions].isLiveStream
				},
				{
					name: t('Open home page'),
					icon: 'home',
					onPress: () => {
						refOption.current.close()
						Linking.openURL(queue[indexOptions].homePageUrl)
					},
					hidden: indexOptions >= 0 && !queue[indexOptions].homePageUrl
				},
				{
					name: t('Remove from queue'),
					icon: 'trash',
					onPress: removeFromQueueOpt,
					hidden: song.index === indexOptions
				}
			]} />
	);
}

export default OptionsQueue;