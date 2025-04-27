import React from 'react';
import { Text, View, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { playSong } from '~/utils/player';
import { SongContext, SongDispatchContext } from '~/contexts/song';
import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import { getApi, getApiNetworkFirst } from '~/utils/api';
import { urlStream } from '~/utils/api';
import { useNavigation } from '@react-navigation/native';
import OptionsPopup from '~/components/popup/OptionsPopup';
import SongItem from '~/components/lists/SongItem';
import size from '~/styles/size';

const SongsList = ({ songs, isIndex = false, listToPlay = null, isMargin = true, indexPlaying = null, idPlaylist = null, onUpdate = () => { }, onPress = () => { } }) => {
	const navigation = useNavigation()
	const song = React.useContext(SongContext)
	const theme = React.useContext(ThemeContext)
	const config = React.useContext(ConfigContext)
	const songDispatch = React.useContext(SongDispatchContext)
	const [indexOptions, setIndexOptions] = React.useState(-1)
	const [playlistList, setPlaylistList] = React.useState([])
	const isMultiCD = React.useMemo(() => songs?.filter(item => item.discNumber !== songs[0].discNumber).length > 0, [songs])
	const reffOption = React.useRef()

	return (
		<View style={{
			flexDirection: 'column',
			paddingHorizontal: isMargin ? 20 : 0,
		}}>
			{songs?.map((item, index) => {
				return (
					<View key={index}>
						{
							isIndex && isMultiCD && (index === 0 || songs[index - 1].discNumber !== item.discNumber) &&
							<View style={{ flexDirection: 'row', alignItems: 'center', marginStart: 5, marginBottom: 15, marginTop: 10, color: theme.primaryText }}>
								<Icon name="circle-o" size={size.icon.small} color={theme.secondaryText} />
								<Text style={{ color: theme.secondaryText, fontSize: size.text.large, marginBottom: 2, marginStart: 10 }}>Disc {item.discNumber}</Text>
							</View>
						}
						<SongItem
							song={item}
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
						name: 'Info',
						icon: 'info',
						onPress: () => {
							setIndexOptions(-1)
							reffOption.current.setInfo(songs[indexOptions])
						}
					},
				]} />
		</View>
	)
}

export default SongsList;