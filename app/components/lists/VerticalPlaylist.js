import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import OptionsPopup from '~/components/popup/OptionsPopup';
import { getApi } from '~/utils/api';
import { SettingsContext, SetSettingsContext } from '~/contexts/settings';

const VerticalPlaylist = ({ config, playlists }) => {
	const navigation = useNavigation();
	const [indexOption, setIndexOption] = React.useState(-1);
	const [deletePlaylists, setDeletePlaylists] = React.useState([])
	const settings = React.useContext(SettingsContext)
	const setSettings = React.useContext(SetSettingsContext)
	const theme = React.useContext(ThemeContext)

	const deletePlaylist = (id) => {
		getApi(config, 'deletePlaylist', `id=${id}`)
			.then((json) => {
				setIndexOption(-1)
				setDeletePlaylists([...deletePlaylists, id])
			})
			.catch((error) => { })
	}

	return (
		<View style={{
			paddingHorizontal: 20,
			width: '100%',
		}}>
			{
				playlists?.map((playlist, index) => {
					if (deletePlaylists.includes(playlist.id)) return null
					return (
						<TouchableOpacity style={styles.favoritedSong} key={playlist.id}
							onLongPress={() => setIndexOption(index)}
							delayLongPress={200}
							onPress={() => navigation.navigate('Playlist', { playlist: playlist })}>
							<Image
								style={styles.albumCover}
								source={{
									uri: urlCover(config, playlist.id, 100),
								}}
							/>
							<View style={{ flex: 1, flexDirection: 'column' }}>
								<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: 16, marginBottom: 2 }}>{playlist.name}</Text>
								<Text numberOfLines={1} style={{ color: theme.secondaryLight }}>{(playlist.duration / 60) | 1} minutes</Text>
							</View>
							{settings.pinPlaylist.includes(playlist.id) && <Icon name="bookmark" size={23} color={theme.secondaryLight} style={{ paddingEnd: 5, paddingStart: 10 }} />}
						</TouchableOpacity>
					)
				})
			}
			<OptionsPopup
				visible={indexOption >= 0}
				close={() => setIndexOption(-1)}
				options={[
					...(() => {
						if (indexOption < 0) return []
						if (!settings.pinPlaylist.includes(playlists[indexOption].id)) return [{
							name: 'Pin Playlist',
							icon: 'bookmark',
							onPress: () => {
								setSettings({ ...settings, pinPlaylist: [...settings.pinPlaylist, playlists[indexOption].id] })
								setIndexOption(-1)
							}
						}]
						return [{
							name: 'Unpin Playlist',
							icon: 'bookmark',
							onPress: () => {
								setSettings({ ...settings, pinPlaylist: settings.pinPlaylist.filter(id => id !== playlists[indexOption].id) })
								setIndexOption(-1)
							}
						}]
					})(),
					{
						name: 'Delete Playlist',
						icon: 'trash',
						onPress: () => {
							deletePlaylist(playlists[indexOption].id)
						}
					}
				]}
			/>
		</View>
	)
}

const styles = {
	favoritedSong: {
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

export default VerticalPlaylist;