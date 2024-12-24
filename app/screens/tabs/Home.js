import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SongContext } from '~/contexts/song';
import { ConfigContext } from '~/contexts/config';

import { getApi } from '~/utils/api';
import { playSong } from '~/utils/player';
import { SettingsContext } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import HorizontalList from '~/components/lists/HorizontalList';
import IconButton from '~/components/button/IconButton';
import mainStyles from '~/styles/main';

const Home = () => {
	const insets = useSafeAreaInsets();
	const [song, songDispatch] = React.useContext(SongContext)
	const config = React.useContext(ConfigContext)
	const settings = React.useContext(SettingsContext)
  const theme = React.useContext(ThemeContext)
	const [statusRefresh, setStatusRefresh] = React.useState();
	const [refreshing, setRefreshing] = React.useState(false);
	const rotationValue = React.useRef(new Animated.Value(0)).current;
	const rotation = rotationValue.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '360deg']
	})

	const onRefresh = () => {
		if (refreshing) return;
		setRefreshing(true);
	};

	const clickRandomSong = () => {
		getApi(config, 'getRandomSongs', `count=50`)
			.then((json) => {
				playSong(config, songDispatch, json.randomSongs.song, 0)
			})
			.catch((error) => { })
	}

	React.useEffect(() => {
		if (refreshing) {
			rotationValue.setValue(0)
			Animated.timing(rotationValue, {
				toValue: 1,
				duration: 1000,
				useNativeDriver: true,
			}).start()
			setTimeout(() => {
				setRefreshing(false)
			}, 1000)
		}
	}, [refreshing])

	const getStatusRefresh = () => {
		getApi(config, 'getScanStatus')
			.then((json) => {
				if (json.scanStatus.scanning) {
					setTimeout(() => {
						getStatusRefresh()
					}, 1000)
					setStatusRefresh(json.scanStatus)
				} else {
					setRefreshing(true)
					setStatusRefresh()
				}
			})
			.catch((error) => { })
	}

	const refreshServer = () => {
		setRefreshing(true)
		getApi(config, 'startScan', 'fullScan=true')
			.then((json) => {
				getStatusRefresh()
			})
			.catch((error) => { })
	}

	return (
		<ScrollView vertical={true}
			style={mainStyles.mainContainer(insets, theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		// refreshControl={(Platform.OS === 'ios' || Platform.OS === 'android') ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primaryLight} /> : null}
		>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 20 }}>
				<TouchableOpacity style={styles.boxRandom(theme)}
					onPress={clickRandomSong}>
					<Text style={styles.textRandom(theme)}>Random Song</Text>
				</TouchableOpacity>
				{statusRefresh ?
					<Text style={mainStyles.subTitle(theme)}>
						{statusRefresh.count}°
					</Text> :
					<Animated.View style={{
						transform: [{
							rotate: rotation
						}]
					}}>
						<IconButton
							icon="refresh"
							size={30}
							color={theme.primaryLight}
							style={{ paddingHorizontal: 10 }}
							onLongPress={refreshServer}
							delayLongPress={200}
							onPress={() => setRefreshing(true)}
						/>
					</Animated.View>
				}
			</View>
			{config?.url && settings?.homeOrder?.map((value, index) =>
				<HorizontalList key={index} config={config} refresh={refreshing} {...value} />
			)}
		</ScrollView>
	);
}

const styles = {
	boxRandom: theme => ({
		backgroundColor: theme.secondaryTouch,
		alignItems: 'center',
		padding: 7,
		paddingHorizontal: 15,
		justifyContent: 'center',
		borderRadius: 50,
	}),
	textRandom: theme => ({
		fontSize: 18,
		color: theme.innerTouch,
		fontWeight: 'bold',
	}),
}

export default Home;