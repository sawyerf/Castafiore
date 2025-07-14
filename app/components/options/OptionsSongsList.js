import React from 'react';
import { Platform, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { ConfigContext } from '~/contexts/config';
import { getApi, getApiNetworkFirst, urlStream } from '~/utils/api';
import { playSong } from '~/utils/player';
import { SongContext, SongDispatchContext } from '~/contexts/song';
import { urlCover } from '~/utils/api';
import OptionsPopup from '~/components/popup/OptionsPopup';

const OptionsSongsList = ({ songs, indexOptions, setIndexOptions, onUpdate = () => { }, idPlaylist = null }) => {
	const { t } = useTranslation();
	const navigation = useNavigation();
	const song = React.useContext(SongContext);
	const songDispatch = React.useContext(SongDispatchContext);
	const config = React.useContext(ConfigContext);
	const refOption = React.useRef();

	const playSimilarSongs = () => {
		getApiNetworkFirst(config, 'getSimilarSongs', `id=${songs[indexOptions].id}&count=50`)
			.then((json) => {
				if (!json.similarSongs?.song) {
					playSong(config, songDispatch, [songs[indexOptions]], 0)
				} else {
					playSong(config, songDispatch, json.similarSongs?.song, 0)
				}
			})
			.catch(() => { })
		refOption.current.close()
	}

	const addToQueue = () => {
		if (song.queue) songDispatch({ type: 'addQueue', queue: [songs[indexOptions]] })
		else playSong(config, songDispatch, [songs[indexOptions]], 0)
		refOption.current.close()
	}

	const goToArtist = () => {
		navigation.navigate('Artist', { id: songs[indexOptions].artistId, name: songs[indexOptions].artist })
		refOption.current.close()
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
				);
			})
			.catch(() => { })
	}

	const addToPlaylist = (playlist) => {
		getApi(config, 'updatePlaylist', `playlistId=${playlist.id}&songIdToAdd=${songs[indexOptions].id}`)
			.then(() => {
				refOption.current.close()
				onUpdate()
			})
			.catch(() => { })
	}

	const removeFromPlaylist = () => {
		getApi(config, 'updatePlaylist', `playlistId=${idPlaylist}&songIndexToRemove=${songs[indexOptions].index}`)
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
				const a = document.createElement('a');
				a.download = `${songs[indexOptions].artist} - ${songs[indexOptions].title}.mp3`;
				a.href = URL.createObjectURL(data);
				a.addEventListener('click', () => {
					setTimeout(() => URL.revokeObjectURL(a.href), 1 * 1000);
				});
				a.click();
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
					name: t('Add to queue'),
					icon: 'th-list',
					onPress: addToQueue
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
				...(
					!idPlaylist ? [] : [
						{
							name: t('Remove from playlist'),
							icon: 'trash-o',
							onPress: removeFromPlaylist
						}
					]
				),
				...Platform.select({
					web: [{
						name: t('Download'),
						icon: 'download',
						onPress: downloadSong
					}],
					default: []
				}),
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
	);
}

export default OptionsSongsList;