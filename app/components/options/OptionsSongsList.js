import React from 'react';
import { Platform, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { playSong } from '~/utils/player';
import { getApi, getApiNetworkFirst, urlStream } from '~/utils/api';
import { ConfigContext } from '~/contexts/config';
import { SongContext, SongDispatchContext } from '~/contexts/song';
import OptionsPopup from '~/components/popup/OptionsPopup';

const OptionsSongsList = ({ songs, indexOptions, setIndexOptions, onUpdate=() => {}, idPlaylist = null }) => {
	const navigation = useNavigation();
	const song = React.useContext(SongContext);
	const songDispatch = React.useContext(SongDispatchContext);
	const config = React.useContext(ConfigContext);
	const [playlistList, setPlaylistList] = React.useState([]);
	const reffOption = React.useRef();

	return (
		<OptionsPopup
			reff={reffOption}
			visible={indexOptions >= 0}
			close={() => {
				setPlaylistList([])
				setIndexOptions(-1)
			}}
			item={indexOptions >= 0 ? songs[indexOptions] : null}
			options={[
				{
					name: 'Play similar songs',
					icon: 'play',
					onPress: () => {
						getApiNetworkFirst(config, 'getSimilarSongs', `id=${songs[indexOptions].id}&count=50`)
							.then((json) => {
								if (!json.similarSongs?.song) {
									playSong(config, songDispatch, [songs[indexOptions]], 0)
								} else {
									playSong(config, songDispatch, json.similarSongs?.song, 0)
								}
							})
							.catch(() => { })
						setIndexOptions(-1)
					}
				},
				{
					name: 'Add to queue',
					icon: 'th-list',
					onPress: () => {
						if (song.queue) {
							songDispatch({ type: 'addQueue', queue: [songs[indexOptions]] })
						} else {
							playSong(config, songDispatch, [songs[indexOptions]], 0)
						}
						setIndexOptions(-1)
					}
				},
				{
					name: 'Go to artist',
					icon: 'user',
					onPress: () => {
						navigation.navigate('Artist', { id: songs[indexOptions].artistId, name: songs[indexOptions].artist })
						setIndexOptions(-1)
					}
				},
				{
					name: 'Go to album',
					icon: 'folder-open',
					onPress: () => {
						navigation.navigate('Album', { id: songs[indexOptions].albumId, name: songs[indexOptions].album, artist: songs[indexOptions].artist, artistId: songs[indexOptions].artistId })
						setIndexOptions(-1)
					}
				},
				{
					name: 'Add to playlist',
					icon: 'plus',
					onPress: () => {
						if (playlistList.length > 0) {
							setPlaylistList([])
							return
						}
						getApi(config, 'getPlaylists')
							.then((json) => {
								setPlaylistList(json.playlists.playlist)
							})
							.catch(() => { })
					}
				},
				...(playlistList?.map((playlist) => ({
					name: playlist.name,
					icon: 'angle-right',
					indent: 1,
					onPress: () => {
						getApi(config, 'updatePlaylist', `playlistId=${playlist.id}&songIdToAdd=${songs[indexOptions].id}`)
							.then(() => {
								setIndexOptions(-1)
								setPlaylistList([])
								onUpdate()
							})
							.catch(() => { })
					}
				})) || []),
				...(() => {
					if (!idPlaylist) return []
					return ([
						{
							name: 'Remove from playlist',
							icon: 'trash-o',
							onPress: () => {
								getApi(config, 'updatePlaylist', `playlistId=${idPlaylist}&songIndexToRemove=${songs[indexOptions].index}`)
									.then(() => {
										setIndexOptions(-1)
										setPlaylistList([])
										onUpdate()
									})
									.catch(() => { })
							}
						}
					])
				})(),
				...(() => {
					if (Platform.OS != 'web') return []
					return ([{
						name: 'Download',
						icon: 'download',
						onPress: async () => {
							setIndexOptions(-1)
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
					}])
				})(),
				{
					name: 'Share',
					icon: 'share',
					onPress: () => {
						getApi(config, 'createShare', { id: songs[indexOptions].id })
							.then((json) => {
								if (json.shares.share.length > 0) {
									if (Platform.OS === 'web') navigator.clipboard.writeText(json.shares.share[0].url)
									else Share.share({ message: json.shares.share[0].url })
								}
							})
							.catch(() => { })
						reffOption.current.close()
					}
				},
				{
					name: 'Info',
					icon: 'info',
					onPress: () => {
						setIndexOptions(-1)
						reffOption.current.showInfo(songs[indexOptions])
					}
				},
			]} />
	);
}

export default OptionsSongsList;