import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HorizontalAlbumList from '../components/HorizontalAlbumList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Home = (navigation) => {
	const insets = useSafeAreaInsets();
	const [config, setConfig] = React.useState({});

	const getConfig = async () => {
		const query = await AsyncStorage.getItem('config.query')
		const configUrl = await AsyncStorage.getItem('config.url')
		setConfig({ url: configUrl, query: query })
	}

	React.useEffect(() => {
		if (!config?.url) {
			getConfig()
		}
	})

	return (
		<ScrollView vertical={true} style={{
			flex: 1,
			backgroundColor: '#0e0e0e',
			paddingTop: insets.top,
			paddingBottom: insets.bottom,
			paddingLeft: insets.left,
			paddingRight: insets.right,
		}}>
			<View style={styles.boxRandom}>
				<Text style={styles.textRandom}>Random Song from</Text>
				<Text style={styles.textRandom}>My Music</Text>
			</View>
			{config?.url && <HorizontalAlbumList config={config} title={'Recently Added'} type={'newest'} navigation={navigation} />}
			{config?.url && <HorizontalAlbumList config={config} title={'Most Played'} type={'frequent'} navigation={navigation} />}
			{config?.url && <HorizontalAlbumList config={config} title={'Recently Played'} type={'recent'} navigation={navigation} />}
		</ScrollView>
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