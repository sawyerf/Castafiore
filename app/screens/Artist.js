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

const Artist = ({ navigation, route }) => {
	const insets = useSafeAreaInsets();
	const [artist, setArtist] = React.useState([]);
	const [artistInfo, setArtistInfo] = React.useState([]);
	const sound = React.useContext(SoundContext)
	const config = React.useContext(ConfigContext)

	const getArtistInfo = () => {
		fetch(`${config.url}/rest/getArtistInfo?id=${route.params.artist.id}&${config.query}`)
			.then((res) => res.json())
			.then((json) => {
				if (json['subsonic-response'] && !json['subsonic-response']?.error) {
					setArtistInfo(json['subsonic-response'].artistInfo)
				} else {
					console.log('getArtistInfo:', json['subsonic-response']?.error)
				}
			})
	}

	const getArtist = () => {
		fetch(`${config.url}/rest/getArtist?id=${route.params.artist.id}&${config.query}`)
			.then((res) => res.json())
			.then((json) => {
				if (json['subsonic-response'] && !json['subsonic-response']?.error) {
					setArtist(json['subsonic-response'].artist)
				} else {
					console.log('getArtist:', json['subsonic-response']?.error)
				}
			})
	}

	const getSimilarSongs = () => {
		fetch(`${config.url}/rest/getSimilarSongs?id=${route.params.artist.id}&count=50&${config.query}`)
			.then((res) => res.json())
			.then((json) => {
				if (json['subsonic-response'] && !json['subsonic-response']?.error) {
					const songs = json['subsonic-response'].similarSongs.song
					playSong(config, sound, songs, 0)
				} else {
					console.log('getSimilarSongs:', json['subsonic-response']?.error)
				}
			})
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
			{config.url && <Image
				style={presStyles.cover}
				source={{
					uri: `${config.url}/rest/getCoverArt?id=${artist.coverArt}&${config.query}`,
				}}
			/>}
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