import React from 'react';
import { Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/contexts/config';
import { useCachedAndApi } from '~/utils/api';
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
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)

	const songs = useCachedAndApi([], 'getAlbum', `id=${route.params.album.id}`, (json, setData) => {
		setData(json?.album?.song.sort((a, b) => {
			// sort by discNumber and track
			if (a.discNumber < b.discNumber) return -1;
			if (a.discNumber > b.discNumber) return 1;
			if (a.track < b.track) return -1;
			if (a.track > b.track) return 1;
			return 0;
		}))
	}, [route.params.album])

	return (
		<ScrollView
			vertical={true}
			style={mainStyles.mainContainer(insets, theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets, false)}>
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
				<FavoritedButton id={route.params.album.id} isFavorited={route.params.album.starred} style={[presStyles.button, { paddingEnd: 0 }]} size={25} />
				<RandomButton songList={songs} size={25} />
			</View>
			<SongsList songs={songs} isIndex={true} />
		</ScrollView>
	)
}

export default Album;