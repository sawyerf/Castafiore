import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HorizontalAlbumList from '../components/HorizontalAlbumList';
import PlayerBox from '../components/PlayerBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';

const Home = (navigation) => {
	const insets = useSafeAreaInsets();
	const [config, setConfig] = React.useState({});

	const [sound, setSound] = React.useState();

	const playSound = async (streamUrl) => {
		// play sound with Expo AV
		console.log(streamUrl)
		if (sound) {
			await sound.unloadAsync()
			await sound.loadAsync({ uri: streamUrl })
			sound.playAsync()
		} else {
			const sound = new Audio.Sound()
			setSound(sound)
			await sound.loadAsync({ uri: streamUrl })
			sound.playAsync()
		}

	}

	const clickRandomSong = async () => {
		console.log('clickRandomSong')
		fetch(config.url + '/rest/getRandomSongs?' + config.query)
			.then((response) => response.json())
			.then((json) => {
				console.log(json)
				const song = json['subsonic-response'].randomSongs.song[0]
				playSound(config.url + '/rest/download?id=' + song.id + '&' + config.query)
			})
	}

	const getConfig = async () => {
		const query = await AsyncStorage.getItem('config.query')
		const configUrl = await AsyncStorage.getItem('config.url')
		setConfig({ url: configUrl, query: query })
	}

	React.useEffect(() => {
		getConfig()
	}, [])

	return (
		<View style={{ flex: 1 }}>
			<ScrollView vertical={true} style={{
				flex: 1,
				backgroundColor: '#0e0e0e',
				paddingTop: insets.top,
				paddingBottom: insets.bottom,
				paddingLeft: insets.left,
				paddingRight: insets.right,
			}}>
				<View style={styles.boxRandom} onTouchEnd={clickRandomSong}>
					<Text style={styles.textRandom}>Random Song from</Text>
					<Text style={styles.textRandom}>My Music</Text>
				</View>
				{config?.url && <HorizontalAlbumList config={config} title={'Recently Added'} type={'newest'} navigation={navigation} />}
				{config?.url && <HorizontalAlbumList config={config} title={'Most Played'} type={'frequent'} navigation={navigation} />}
				{config?.url && <HorizontalAlbumList config={config} title={'Recently Played'} type={'recent'} navigation={navigation} />}
			</ScrollView>
			<PlayerBox />
		</View>
	);
}

const styles = {
	boxRandom: {
		backgroundColor: 'green',
		height: 100,
		alignItems: 'center',
		justifyContent: 'center',
		margin: 20,
		borderRadius: 10,
	},
	textRandom: {
		fontSize: 20,
		color: 'white',
		fontWeight: 'bold',
	}
}

export default Home;