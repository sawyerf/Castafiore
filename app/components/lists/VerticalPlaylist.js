import React from 'react';
import { Text, View, Image, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext } from '~/contexts/config';
import { confirmAlert } from '~/utils/alert';
import { getApi, urlCover } from '~/utils/api';
import { ThemeContext } from '~/contexts/theme';
import OptionsPopup from '~/components/popup/OptionsPopup';
import mainStyles from '~/styles/main';
import size from '~/styles/size';

const VerticalPlaylist = ({ playlists, onRefresh }) => {
	const navigation = useNavigation();
	const [indexOption, setIndexOption] = React.useState(-1);
	const [deletePlaylists, setDeletePlaylists] = React.useState([])
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const refOption = React.useRef()

	const isPin = (index) => {
		return playlists[index].comment?.includes(`#${config.username}-pin`)
	}

	const deletePlaylist = (id) => {
		getApi(config, 'deletePlaylist', `id=${id}`)
			.then(() => {
				setIndexOption(-1)
				setDeletePlaylists([...deletePlaylists, id])
			})
			.catch(() => { })
	}

	const pinToComment = (index) => {
		getApi(config, 'updatePlaylist', {
			playlistId: playlists[index].id,
			comment: `${playlists[index].comment || ''}\n#${config.username}-pin`,
		})
			.then(() => {
				onRefresh()
			})
			.catch(() => { })
	}

	const unPinToComment = (index) => {
		if (!playlists[index].comment) return
		if (!playlists[index].comment.includes(`\n#${config.username}-pin`)) return
		getApi(config, 'updatePlaylist', {
			playlistId: playlists[index].id,
			comment: playlists[index].comment.replaceAll(`#${config.username}-pin`, ''),
		})
			.then(() => {
				onRefresh()
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
								<Text numberOfLines={1} style={{ color: theme.primaryText, fontSize: size.text.medium, marginBottom: 2 }}>
									{playlist.name}
									{!playlist.public && <Icon name='lock' size={10} color={theme.secondaryText} style={{ paddingStart: 5 }} />}
								</Text>
								<Text numberOfLines={1} style={{ color: theme.secondaryText, fontSize: size.text.small }}>{(playlist.duration / 60) | 1} min · {playlist.songCount} songs</Text>
							</View>
							{playlist.comment?.includes(`#${config.username}-pin`) && <Icon name="bookmark" size={size.icon.small} color={theme.secondaryText} style={{ paddingEnd: 5, paddingStart: 10 }} />}
						</Pressable>
					)
				})
			}
			<OptionsPopup
				reff={refOption}
				visible={indexOption >= 0}
				close={() => setIndexOption(-1)}
				item={indexOption !== -1 ? playlists[indexOption] : null}
				options={[
					...(() => {
						if (indexOption < 0) return []
						if (!isPin(indexOption)) return [{
							name: 'Pin Playlist',
							icon: 'bookmark',
							onPress: () => {
								setIndexOption(-1)
								pinToComment(indexOption)
							}
						}]
						return [{
							name: 'Unpin Playlist',
							icon: 'bookmark',
							onPress: () => {
								setIndexOption(-1)
								unPinToComment(indexOption)
							}
						}]
					})(),
					{
						name: (indexOption !== -1 && playlists[indexOption].public) ? 'Make Private' : 'Make Public',
						icon: (indexOption !== -1 && playlists[indexOption].public) ? 'lock' : 'globe',
						onPress: () => {
							getApi(config, 'updatePlaylist', {
								playlistId: playlists[indexOption].id,
								public: !playlists[indexOption].public,
							})
								.then(() => {
									onRefresh()
									setIndexOption(-1)
								})
								.catch(() => { })
						}
					},
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
					{
						name: 'Info',
						icon: 'info',
						onPress: () => {
							refOption.current.setInfo(playlists[indexOption])
							setIndexOption(-1)
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