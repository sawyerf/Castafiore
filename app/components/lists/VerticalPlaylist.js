import React from 'react';
import { Text, View, Image, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext } from '~/contexts/config';
import { confirmAlert } from '~/utils/alert';
import { getApi, urlCover } from '~/utils/api';
import { SettingsContext, SetSettingsContext } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import OptionsPopup from '~/components/popup/OptionsPopup';
import mainStyles from '~/styles/main';
import size from '~/styles/size';

const VerticalPlaylist = ({ playlists }) => {
	const navigation = useNavigation();
	const [indexOption, setIndexOption] = React.useState(-1);
	const [deletePlaylists, setDeletePlaylists] = React.useState([])
	const config = React.useContext(ConfigContext)
	const settings = React.useContext(SettingsContext)
	const setSettings = React.useContext(SetSettingsContext)
	const theme = React.useContext(ThemeContext)

	const deletePlaylist = (id) => {
		getApi(config, 'deletePlaylist', `id=${id}`)
			.then(() => {
				setIndexOption(-1)
				setDeletePlaylists([...deletePlaylists, id])
			})
			.catch(() => { })
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
						<Pressable
							style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.favoritedSong])}
							key={playlist.id}
							onLongPress={() => setIndexOption(index)}
							delayLongPress={200}
							onPress={() => navigation.navigate('Playlist', { playlist: playlist })}>
							<Image
								style={[mainStyles.coverSmall(theme), { marginRight: 10 }]}
								source={{
									uri: urlCover(config, playlist.id, 100),
								}}
							/>
							<View style={{ flex: 1, flexDirection: 'column' }}>
								<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: size.text.medium, marginBottom: 2 }}>{playlist.name}</Text>
								<Text numberOfLines={1} style={{ color: theme.secondaryLight, fontSize: size.text.small }}>{(playlist.duration / 60) | 1} min · {playlist.songCount} songs</Text>
							</View>
							{settings.pinPlaylist.includes(playlist.id) && <Icon name="bookmark" size={size.icon.small} color={theme.secondaryLight} style={{ paddingEnd: 5, paddingStart: 10 }} />}
						</Pressable>
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
							confirmAlert(
								'Delete Playlist',
								`Are you sure you want to delete playlist: '${playlists[indexOption].name}' ?`,
								() => deletePlaylist(playlists[indexOption].id),
								() => setIndexOption(-1),
							)
						}
					},
				]}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	favoritedSong: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
})

export default VerticalPlaylist;