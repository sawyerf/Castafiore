import React from 'react';
import { Text, View, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { playSong } from '~/utils/player';
import { SongContext } from '~/contexts/song';
import { ThemeContext } from '~/contexts/theme';
import { getApi, getApiNetworkFirst } from '~/utils/api';
import { urlStream } from '~/utils/api';
import { useNavigation } from '@react-navigation/native';
import ErrorPopup from '~/components/popup/ErrorPopup';
import InfoPopup from '~/components/popup/InfoPopup';
import OptionsPopup from '~/components/popup/OptionsPopup';
import SongItem from '~/components/lists/SongItem';

const SongsList = ({ config, songs, isIndex = false, listToPlay = null, isMargin = true, indexPlaying = null, idPlaylist = null, onUpdate = () => { }, onPress = () => { } }) => {
	const [songCon, songDispatch] = React.useContext(SongContext)
	const [indexOptions, setIndexOptions] = React.useState(-1)
	const multiCD = songs?.filter(song => song.discNumber !== songs[0].discNumber).length > 0
	const [playlistList, setPlaylistList] = React.useState([])
	const [songInfo, setSongInfo] = React.useState(null)
	const [error, setError] = React.useState(null)
	const navigation = useNavigation()
	const theme = React.useContext(ThemeContext)

	return (
		<View style={{
			flexDirection: 'column',
			paddingHorizontal: isMargin ? 20 : 0,
		}}>
			{songs?.map((song, index) => {
				return (
					<View key={index}>
						{
							isIndex && multiCD && (index === 0 || songs[index - 1].discNumber !== song.discNumber) &&
							<View style={{ flexDirection: 'row', alignItems: 'center', marginStart: 5, marginBottom: 15, marginTop: 10, color: theme.primaryLight }}>
								<Icon name="circle-o" size={23} color={theme.secondaryLight} />
								<Text style={{ color: theme.secondaryLight, fontSize: 20, marginBottom: 2, marginStart: 10 }}>Disc {song.discNumber}</Text>
							</View>
						}
						<SongItem
							config={config}
							song={song}
							queue={listToPlay ? listToPlay : songs}
							index={index}
							isIndex={isIndex}
							isPlaying={indexPlaying === index}
							setIndexOptions={setIndexOptions}
							onPress={onPress}
						/>
					</View>
				)
			})}

			{/* Popups */}
			<ErrorPopup message={error} close={() => setError(null)} />
			<InfoPopup info={songInfo} close={() => setSongInfo(null)} />
			<OptionsPopup
				visible={indexOptions >= 0}
				close={() => {
					setPlaylistList([])
					setIndexOptions(-1)
				}}
				options={[
					{
						name: 'Play similar songs',
						icon: 'play',
						onPress: () => {
							getApiNetworkFirst(config, 'getSimilarSongs', `id=${songs[indexOptions].id}&count=50`)
								.then((json) => {
									if (!json.similarSongs?.song) {
										setError('No similar songs found')
										playSong(config, songDispatch, [songs[indexOptions]], 0)
									} else {
										playSong(config, songDispatch, json.similarSongs?.song, 0)
									}
								})
								.catch((error) => { })
							setIndexOptions(-1)
						}
					},
					{
						name: 'Add to queue',
						icon: 'th-list',
						onPress: () => {
							if (songCon.queue) {
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
							navigation.navigate('Artist', { artist: { id: songs[indexOptions].artistId, name: songs[indexOptions].artist } })
							setIndexOptions(-1)
						}
					},
					{
						name: 'Go to album',
						icon: 'folder-open',
						onPress: () => {
							navigation.navigate('Album', { album: { id: songs[indexOptions].albumId, name: songs[indexOptions].album, artist: songs[indexOptions].artist } })
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
								.catch((error) => { })
						}
					},
					...playlistList?.map((playlist, index) => ({
						name: playlist.name,
						icon: 'angle-right',
						indent: 1,
						onPress: () => {
							getApi(config, 'updatePlaylist', `playlistId=${playlist.id}&songIdToAdd=${songs[indexOptions].id}`)
								.then((json) => {
									setIndexOptions(-1)
									setPlaylistList([])
									onUpdate()
								})
								.catch((error) => { })
						}
					})),
					...(() => {
						if (!idPlaylist) return []
						return ([
							{
								name: 'Remove from playlist',
								icon: 'trash-o',
								onPress: () => {
									getApi(config, 'updatePlaylist', `playlistId=${idPlaylist}&songIndexToRemove=${indexOptions}`)
										.then((json) => {
											setIndexOptions(-1)
											setPlaylistList([])
											onUpdate()
										})
										.catch((error) => { })
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
										a.addEventListener('click', (e) => {
											setTimeout(() => URL.revokeObjectURL(a.href), 1 * 1000);
										});
										a.click();
									})
									.catch((error) => { })
							}
						}])
					})(),
					{
						name: 'Info',
						icon: 'info',
						onPress: () => {
							setIndexOptions(-1)
							setSongInfo(songs[indexOptions])
						}
					},
				]} />
		</View>
	)
}

export default SongsList;