import React from 'react';
import { Text, View, TextInput, Image, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/contexts/config';
import { getApi, urlCover, getCachedAndApi } from '~/utils/api';
import { ThemeContext } from '~/contexts/theme';
import BackButton from '~/components/button/BackButton';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import RandomButton from '~/components/button/RandomButton';
import SongsList from '~/components/lists/SongsList';

const Playlist = ({ route: { params } }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const [info, setInfo] = React.useState(null)
	const [songs, setSongs] = React.useState([]);
	const [title, setTitle] = React.useState(null)

	const getPlaylist = () => {
		getCachedAndApi(config, 'getPlaylist', `id=${params.playlist.id}`, (json) => {
			setInfo(json?.playlist)
			setSongs(json?.playlist?.entry)
		})
	}

	React.useEffect(() => {
		if (config.query) getPlaylist()
	}, [config, params.playlist.id])

	return (
		<ScrollView
			vertical={true}
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets, false)}>
			<BackButton />
			<Image
				style={[presStyles.cover, { backgroundColor: theme.secondaryDark }]}
				source={{
					uri: urlCover(config, params.playlist.id),
				}}
			/>
			<View style={presStyles.headerContainer}>
				<View style={{ flex: 1 }}>
					{
						title != null ?
							<TextInput
								style={presStyles.title(theme)}
								value={title}
								onChangeText={text => setTitle(text)}
								autoFocus={true}
								onSubmitEditing={() => {
									getApi(config, 'updatePlaylist', `playlistId=${params.playlist.id}&name=${title}`)
										.then(() => {
											setTitle(null)
											getPlaylist()
										})
										.catch(() => { })
								}}
								onBlur={() => setTitle(null)}
							/>
							:
							<Pressable
								style={mainStyles.opacity}
								onLongPress={() => setTitle(info.name)} delayLongPress={200}
							>
								<Text style={presStyles.title(theme)} numberOfLines={2}>{info?.name || params.playlist?.name}</Text>
							</Pressable>
					}
					<Text style={presStyles.subTitle(theme)}>{((info?.duration || params?.playlist?.duration) / 60) | 1} minutes · {info?.songCount || params?.playlist?.songCount} songs</Text>
				</View>
				<RandomButton songList={songs} style={presStyles.button} />
			</View>
			<SongsList songs={songs} idPlaylist={params.playlist?.id} onUpdate={() => {
				getPlaylist()
			}} />
		</ScrollView>
	)
}

export default Playlist;