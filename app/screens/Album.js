import React from 'react';
import { Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/contexts/config';
import { getCachedAndApi } from '~/utils/api';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import BackButton from '~/components/button/BackButton';
import FavoritedButton from '~/components/button/FavoritedButton';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import RandomButton from '~/components/button/RandomButton';
import SongsList from '~/components/lists/SongsList';

const Album = ({ navigation, route }) => {
	const insets = useSafeAreaInsets();
	const [songs, setSongs] = React.useState([]);
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)

	React.useEffect(() => {
		getCachedAndApi(config, 'getAlbum', `id=${route.params.album.id}`, (json) => {
			setSongs(json?.album?.song.sort((a, b) => {
				// sort by discNumber and track
				if (a.discNumber < b.discNumber) return -1;
				if (a.discNumber > b.discNumber) return 1;
				if (a.track < b.track) return -1;
				if (a.track > b.track) return 1;
				return 0;
			}))
		})
	}, [config, route.params.album])

	return (
		<ScrollView
			vertical={true}
			style={{
				...mainStyles.mainContainer(insets, theme),
				paddingTop: 0,
			}}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}>
			<BackButton />
			<Image
				style={presStyles.cover}
				source={{
					uri: urlCover(config, route.params.album.id),
				}}
			/>
			<View style={presStyles.headerContainer}>
				<View style={{ flex: 1 }}>
					<Text style={presStyles.title(theme)} numberOfLines={2}>{route.params.album.name}</Text>
					<TouchableOpacity onPress={() => navigation.navigate('Artist', { artist: { id: route.params.album.artistId, name: route.params.album.artist } })}>
						<Text style={presStyles.subTitle(theme)}>{route.params.album.artist}</Text>
					</TouchableOpacity>
				</View>
				<FavoritedButton id={route.params.album.id} isFavorited={route.params.album.starred} style={{ ...presStyles.button, paddingEnd: 0 }} config={config} size={25} />
				<RandomButton songList={songs} size={25} />
			</View>
			<SongsList config={config} songs={songs} isIndex={true} />
		</ScrollView>
	)
}

const styles = {
}

export default Album;