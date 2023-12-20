import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import theme from '../utils/theme';
import HorizontalAlbums from '../components/HorizontalAlbums';
import HorizontalArtists from '../components/HorizontalArtists';
import mainStyles from '../styles/main';
import presStyles from '../styles/pres';
import { SoundContext, playSong } from '../utils/playSong';
import { ConfigContext } from '../utils/config';
import BackButton from '../components/BackButton';
import { getApi, urlCover } from '../utils/api';

const Artist = ({ navigation, route }) => {
	const insets = useSafeAreaInsets();
	const [artist, setArtist] = React.useState([]);
	const [artistInfo, setArtistInfo] = React.useState([]);
	const sound = React.useContext(SoundContext)
	const config = React.useContext(ConfigContext)

	const getArtistInfo = () => {
		getApi(config, 'getArtistInfo', `id=${route.params.artist.id}`)
			.then((json) => {
					setArtistInfo(json.artistInfo)
			})
			.catch((error) => { })
	}

	const getArtist = () => {
		getApi(config, 'getArtist', `id=${route.params.artist.id}`)
			.then((json) => {
					setArtist(json.artist)
			})
			.catch((error) => { })
	}

	const getSimilarSongs = () => {
		getApi(config, 'getSimilarSongs', `id=${route.params.artist.id}&count=50`)
			.then((json) => {
					const songs = json.similarSongs.song
					playSong(config, sound, songs, 0)
			})
			.catch((error) => { })
	}

	React.useEffect(() => {
		if (config.url) {
			getArtist()
			getArtistInfo()
		}
	}, [config, route.params.artist])

	return (
		<ScrollView
			style={{
				...mainStyles.mainContainer(insets),
				paddingTop: 0,
			}}
			vertical={true}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}>
			<BackButton />
			<Image
				style={presStyles.cover}
				source={{
					uri: urlCover(config, artist.id),
				}}
			/>
			<View>
				<Text style={{ ...presStyles.title }}>{route.params.artist.name}</Text>
				<Text style={presStyles.subTitle}>Artist</Text>
				<TouchableOpacity style={{ ...presStyles.button }} onPress={getSimilarSongs} >
					<Icon name="random" size={25} color={theme.primaryTouch} />
				</TouchableOpacity>
			</View>
			<Text style={{ ...mainStyles.subTitle, marginStart: 20 }}>Albums</Text>
			<HorizontalAlbums config={config} albums={artist.album} />
			{artistInfo?.similarArtist?.length && (
				<>
					<Text style={{ ...mainStyles.subTitle, margin: 20 }}>Similar Artist</Text>
					<HorizontalArtists config={config} artists={artistInfo.similarArtist} />
				</>
			)}
		</ScrollView>
	)
}

const styles = {
}

export default Artist;