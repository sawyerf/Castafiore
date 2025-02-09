import React from 'react';
import { Text, View, Image, ScrollView, Pressable } from 'react-native';
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
import size from '~/styles/size';

const Album = ({ navigation, route: { params } }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const [isStarred, setStarred] = React.useState(params.starred || false)

	const songs = useCachedAndApi([], 'getAlbum', `id=${params.id}`, (json, setData) => {
		setStarred(json?.album?.starred)
		setData(json?.album?.song.sort((a, b) => {
			// sort by discNumber and track
			if (a.discNumber < b.discNumber) return -1;
			if (a.discNumber > b.discNumber) return 1;
			if (a.track < b.track) return -1;
			if (a.track > b.track) return 1;
			return 0;
		}))
	}, [params.id])

	return (
		<ScrollView
			vertical={true}
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets, false)}>
			<BackButton />
			<Image
				style={[presStyles.cover, { backgroundColor: theme.secondaryBack }]}
				source={{
					uri: urlCover(config, params.id),
				}}
			/>
			<View style={presStyles.headerContainer}>
				<View style={{ flex: 1 }}>
					<Text style={presStyles.title(theme)} numberOfLines={2}>{params.name}</Text>
					<Pressable
						style={mainStyles.opacity}
						onPress={() => navigation.navigate('Artist', { id: params.artistId, name: params.artist })}
					>
						<Text style={presStyles.subTitle(theme)}>{params.artist}</Text>
					</Pressable>
				</View>
				<FavoritedButton id={params.id} isFavorited={isStarred} style={[presStyles.button, { paddingEnd: 0 }]} size={size.icon.medium} />
				<RandomButton songList={songs} size={size.icon.medium} />
			</View>
			<SongsList songs={songs} isIndex={true} />
		</ScrollView>
	)
}

export default Album;