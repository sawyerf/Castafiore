import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SongContext } from '~/contexts/song';
import theme from '~/utils/theme';
import { playSong } from '~/utils/player';

import { urlCover, getApi } from '~/utils/api';
import FavoritedButton from '~/components/button/FavoritedButton';
import OptionsPopup from '~/components/popup/OptionsPopup';
import InfoPopup from '~/components/popup/InfoPopup';

const SongsList = ({ config, songs, isIndex = false, listToPlay = null, isMargin = true, indexPlaying = null, idPlaylist = null, onUpdate = () => { } }) => {
	const [songCon, songDispatch] = React.useContext(SongContext)
	const [visible, setVisible] = React.useState(-1)
	const multiCD = songs?.filter(song => song.discNumber !== songs[0].discNumber).length > 0
	const [playlistList, setPlaylistList] = React.useState([])
	const [songInfo, setSongInfo] = React.useState(null)

	return (
		<View style={{
			flexDirection: 'column',
			paddingHorizontal: isMargin ? 20 : 0,
		}}>
			{songs?.map((song, index) => (
				<View key={index}>
					{
						isIndex && multiCD && (index === 0 || songs[index - 1].discNumber !== song.discNumber) &&
						<View style={{ flexDirection: 'row', alignItems: 'center', marginStart: 5, marginBottom: 15, marginTop: 10, color: theme.primaryLight }}>
							<Icon name="circle-o" size={23} color={theme.secondaryLight} />
							<Text style={{ color: theme.secondaryLight, fontSize: 20, marginBottom: 2, marginStart: 10 }}>Disc {song.discNumber}</Text>
						</View>
					}
					<TouchableOpacity style={styles.song} key={song.id}
						onLongPress={() => setVisible(index)}
						delayLongPress={200}
						onPress={() => playSong(config, songCon, songDispatch, listToPlay ? listToPlay : songs, index)}>
						<Image
							style={styles.albumCover}
							source={{
								uri: urlCover(config, song.albumId, 300),
							}}
						/>
						<View style={{ flex: 1, flexDirection: 'column' }}>
							<Text numberOfLines={1} style={{ color: indexPlaying === index ? theme.primaryTouch : theme.primaryLight, fontSize: 16, marginBottom: 2 }}>{(isIndex && song.track !== undefined) ? `${song.track}. ` : null}{song.title}</Text>
							<Text numberOfLines={1} style={{ color: indexPlaying === index ? theme.secondaryTouch : theme.secondaryLight }}>{song.artist}</Text>
						</View>
						<FavoritedButton id={song.id} isFavorited={song?.starred} config={config} style={{ padding: 5, paddingStart: 10 }} />
					</TouchableOpacity>
					<OptionsPopup visible={visible === index}
						close={() => setVisible(-1)}
						options={[
							{
								name: 'Add to playlist',
								icon: 'plus',
								onPress: () => {
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
								onPress: () => {
									getApi(config, 'updatePlaylist', `playlistId=${playlist.id}&songIdToAdd=${song.id}`)
										.then((json) => {
											setVisible(-1)
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
											getApi(config, 'updatePlaylist', `playlistId=${idPlaylist}&songIndexToRemove=${index}`)
												.then((json) => {
													setVisible(-1)
													setPlaylistList([])
													onUpdate()
												})
												.catch((error) => { })
										}
									}
								])
							})(),
							, {
								name: 'Info',
								icon: 'info',
								onPress: () => {
									setVisible(-1)
									setSongInfo(song)
								}
							},
							{
								name: 'Close',
								icon: 'close',
								onPress: () => {
									setVisible(-1)
									setPlaylistList([])
								}
							}
						]} />
				</View>
			)
			)}
			<InfoPopup songInfo={songInfo} close={() => setSongInfo(null)} />
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