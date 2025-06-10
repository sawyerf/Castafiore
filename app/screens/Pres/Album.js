import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/contexts/config';
import { useCachedAndApi } from '~/utils/api';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import FavoritedButton from '~/components/button/FavoritedButton';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import RandomButton from '~/components/button/RandomButton';
import SongsList from '~/components/lists/SongsList';
import size from '~/styles/size';
import PresHeader from '~/components/PresHeader';

const Album = ({ navigation, route: { params } }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const [isStarred, setStarred] = React.useState(params.starred || false)

	const [songs] = useCachedAndApi([], 'getAlbum', { id: params.id}, (json, setData) => {
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
			<PresHeader
				title={params.name || params.album || params.title}
				subTitle={params.artist || '-'}
				imgSrc={urlCover(config, params)}
				onPressTitle={() => params.artistId && navigation.navigate('Artist', { id: params.artistId, name: params.artist })}
			>
				<FavoritedButton id={params.id} isFavorited={isStarred} style={[presStyles.button, { paddingEnd: 0 }]} size={size.icon.medium} />
				<RandomButton songList={songs} size={size.icon.medium} />
			</PresHeader>
			<SongsList songs={songs} isIndex={true} />
		</ScrollView>
	)
}

export default Album;