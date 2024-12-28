import React from 'react';
import { Text, View, Image, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { getCache } from '~/utils/cache';
import { playSong } from '~/utils/player';
import { SettingsContext } from '~/contexts/settings';
import { SongContext } from '~/contexts/song';
import { ThemeContext } from '~/contexts/theme';
import { urlCover, getApi, getApiNetworkFirst } from '~/utils/api';
import { urlStream } from '~/utils/api';
import { useNavigation } from '@react-navigation/native';
import ErrorPopup from '~/components/popup/ErrorPopup';
import FavoritedButton from '~/components/button/FavoritedButton';
import InfoPopup from '~/components/popup/InfoPopup';
import OptionsPopup from '~/components/popup/OptionsPopup';

const Cached = ({ song, config }) => {
	const [isCached, setIsCached] = React.useState(false)
	const theme = React.useContext(ThemeContext)
	const settings = React.useContext(SettingsContext)

	React.useEffect(() => {
		cached(song)
			.then((res) => {
				setIsCached(res)
			})
	}, [song.id, settings.showCache])

	const cached = async (song) => {
		if (!settings.showCache) return false
		const cache = await getCache('song', urlStream(config, song.id))
		if (cache) return true
		return false
	}

	if (isCached) return (
		<Icon
			name="cloud-download"
			size={14}
			color={theme.secondaryLight}
			style={{ paddingHorizontal: 5 }}
		/>
	)
	return null
}

const SongsList = ({ config, songs, isIndex = false, listToPlay = null, isMargin = true, indexPlaying = null, idPlaylist = null, onUpdate = () => { } }) => {
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
						<TouchableOpacity
							style={styles.song}
							key={song.id}
							onLongPress={() => setIndexOptions(index)}
							onContextMenu={() => setIndexOptions(index)}
							delayLongPress={200}
							onPress={() => playSong(config, songDispatch, listToPlay ? listToPlay : songs, index)}>
							<Image
								style={styles.albumCover}
								source={{
									uri: urlCover(config, song.albumId, 300),
								}}
							/>
							<View style={{ flex: 1, flexDirection: 'column' }}>
								<Text numberOfLines={1} style={{ color: indexPlaying === index ? theme.primaryTouch : theme.primaryLight, fontSize: 16, marginBottom: 2 }}>
									{(isIndex && song.track !== undefined) ? `${song.track}. ` : null}{song.title}
								</Text>
								<Text numberOfLines={1} style={{ color: indexPlaying === index ? theme.secondaryTouch : theme.secondaryLight }}>
									{song.artist}
								</Text>
							</View>
							<Cached song={song} config={config} />
							<FavoritedButton id={song.id} isFavorited={song?.starred} config={config} style={{ padding: 5, paddingStart: 10 }} />
						</TouchableOpacity>
					</View>
				)
			}
			)
			}
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

const styles = {
	song: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	albumCover: {
		height: 50,
		width: 50,
		marginRight: 10,
		borderRadius: 4,
	},
}

export default SongsList;