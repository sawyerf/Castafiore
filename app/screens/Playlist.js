import React from 'react';
import { Text, View, TextInput, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SongsList from '~/components/lists/SongsList';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import RandomButton from '~/components/button/RandomButton';
import { ConfigContext } from '~/contexts/config';
import BackButton from '~/components/button/BackButton';
import { getApi, urlCover } from '~/utils/api';

const Playlist = ({ navigation, route }) => {
	const insets = useSafeAreaInsets();
	const [songs, setSongs] = React.useState([]);
	const config = React.useContext(ConfigContext)
	const [info, setInfo] = React.useState(null)
	const [title, setTitle] = React.useState(null)

	const getPlaylist = () => {
		getApi(config, 'getPlaylist', `id=${route.params.playlist.id}`)
			.then((json) => {
				setInfo(json?.playlist)
				setSongs(json?.playlist?.entry)
			})
			.catch(_ => { })
	}

	React.useEffect(() => {
		if (config.query) getPlaylist()
	}, [config, route.params.playlist])

	return (
		<ScrollView
			vertical={true}
			style={{
				...mainStyles.mainContainer(insets),
				paddingTop: 0,
			}}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}>
			<BackButton />
			<Image
				style={presStyles.cover}
				source={{
					uri: urlCover(config, route.params.playlist.id),
				}}
			/>
			<View style={presStyles.headerContainer}>
				<View style={{ flex: 1 }}>
					{
						title != null ?
							<TextInput
								style={presStyles.title}
								value={title}
								onChangeText={text => setTitle(text)}
								autoFocus={true}
								onSubmitEditing={() => {
									getApi(config, 'updatePlaylist', `playlistId=${route.params.playlist.id}&name=${title}`)
										.then((json) => {
											setTitle(null)
											getPlaylist()
										})
										.catch(_ => { })
								}}
								onBlur={() => setTitle(null)}
							/>
							:
							<TouchableOpacity onLongPress={() => setTitle(info.name)} delayLongPress={200}>
								<Text style={presStyles.title} numberOfLines={2}>{info?.name}</Text>
							</TouchableOpacity>
					}
					<Text style={presStyles.subTitle}>{(route.params.playlist.duration / 60) | 1} minutes · {route.params.playlist.songCount} songs</Text>
				</View>
				<RandomButton songList={songs} />
			</View>
			<SongsList config={config} songs={songs} />
		</ScrollView>
	)
}

const styles = {
}

export default Playlist;