import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { ConfigContext } from '~/contexts/config';
import { getApi } from '~/utils/api';
import { SongContext, SongDispatchContext } from '~/contexts/song';
import { urlCover } from '~/utils/api';
import { removeFromQueue } from '~/utils/player';
import OptionsPopup from '~/components/popup/OptionsPopup';

const OptionsQueue = ({ queue, indexOptions, setIndexOptions, closePlayer }) => {
	const { t } = useTranslation();
	const navigation = useNavigation();
	const song = React.useContext(SongContext);
	const songDispatch = React.useContext(SongDispatchContext);
	const config = React.useContext(ConfigContext);
	const reffOption = React.useRef();

	const goToArtist = () => {
		navigation.navigate('Artist', { id: queue[indexOptions].artistId, name: queue[indexOptions].artist })
		reffOption.current.close()
		closePlayer()
	}

	const goToAlbum = () => {
		navigation.navigate('Album', { id: queue[indexOptions].albumId, name: queue[indexOptions].album, artist: queue[indexOptions].artist, artistId: queue[indexOptions].artistId })
		reffOption.current.close()
		closePlayer()
	}

	const openAddToPlaylist = () => {
		getApi(config, 'getPlaylists')
			.then((json) => {
				if (!json.playlists?.playlist) return

				reffOption.current.setVirtualOptions([
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
				reffOption.current.close()
			})
			.catch(() => { })
	}

	const removeFromQueueOpt = () => {
		removeFromQueue(songDispatch, indexOptions)
		reffOption.current.close()
	}

	return (
		<OptionsPopup
			reff={reffOption}
			visible={indexOptions >= 0}
			close={() => {
				reffOption.current.clearVirtualOptions()
				setIndexOptions(-1)
			}}
			item={indexOptions >= 0 ? queue[indexOptions] : null}
			options={[
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
				...(song.index === indexOptions ? [] : [
					{
						name: t('Remove from queue'),
						icon: 'trash',
						onPress: removeFromQueueOpt
					}]
				),
			]} />
	);
}

export default OptionsQueue;