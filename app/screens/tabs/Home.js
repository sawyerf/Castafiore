import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfigContext } from '~/contexts/config';

import { getApi, getApiNetworkFirst } from '~/utils/api';
import { playSong } from '~/utils/player';
import { SettingsContext } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import HorizontalList from '~/components/lists/HorizontalList';
import IconButton from '~/components/button/IconButton';
import mainStyles from '~/styles/main';
import { SongDispatchContext } from '~/contexts/song';

const Home = () => {
	const insets = useSafeAreaInsets();
	const songDispatch = React.useContext(SongDispatchContext)
	const config = React.useContext(ConfigContext)
	const settings = React.useContext(SettingsContext)
	const theme = React.useContext(ThemeContext)
	const [statusRefresh, setStatusRefresh] = React.useState();
	const [refresh, setRefresh] = React.useState(0);
	const rotationValue = React.useRef(new Animated.Value(0)).current;
	const rotation = rotationValue.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '360deg']
	})

	const clickRandomSong = () => {
		getApiNetworkFirst(config, 'getRandomSongs', `size=50`)
			.then((json) => {
				playSong(config, songDispatch, json.randomSongs.song, 0)
			})
			.catch((error) => { })
	}

	const forceRefresh = () => {
		setRefresh(refresh + 1)
		rotationValue.setValue(0)
		Animated.timing(rotationValue, {
			toValue: 1,
			duration: 1000,
			useNativeDriver: true,
		}).start()
	}

	const getStatusRefresh = () => {
		getApi(config, 'getScanStatus')
			.then((json) => {
				if (json.scanStatus.scanning) {
					setTimeout(() => {
						getStatusRefresh()
					}, 1000)
					setStatusRefresh(json.scanStatus)
				} else {
					forceRefresh()
					setStatusRefresh()
				}
			})
			.catch((error) => { })
	}

	const refreshServer = () => {
		forceRefresh()
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
					<Animated.View style={{ transform: [{ rotate: rotation }] }}>
						<IconButton
							icon="refresh"
							size={30}
							color={theme.primaryLight}
							style={{ paddingHorizontal: 10 }}
							onLongPress={refreshServer}
							delayLongPress={200}
							onPress={forceRefresh}
						/>
					</Animated.View>
				}
			</View>
			{config?.url && settings?.homeOrder?.map((value, index) =>
				<HorizontalList key={index} refresh={refresh} {...value} />
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