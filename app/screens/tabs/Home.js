import React from 'react';
import { Text, View, TextInput, Image, ScrollView, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import HorizontalAlbumList from '~/components/HorizontalAlbumList';
import mainStyles from '~/styles/main';
import theme from '~/utils/theme';
import { SoundContext, playSong } from '~/utils/playSong';
import { ConfigContext } from '~/utils/config';
import { getApi } from '~/utils/api';
import { settings } from '~/utils/settings';
import IconButton from '~/components/button/IconButton';
import { clearCache } from '~/services/serviceWorkerRegistration';

const Home = ({ navigation }) => {
	const insets = useSafeAreaInsets();
	const sound = React.useContext(SoundContext)
	const config = React.useContext(ConfigContext)
	const [statusRefresh, setStatusRefresh] = React.useState();
	const [refreshing, setRefreshing] = React.useState(false);

	const onRefresh = () => {
		if (refreshing) return;
		setRefreshing(true);
	};

	const clickRandomSong = () => {
		getApi(config, 'getRandomSongs', `count=50`)
			.then((json) => {
				playSong(config, sound, json.randomSongs.song, 0)
			})
			.catch((error) => { })
	}

	React.useEffect(() => {
		if (refreshing) {
			clearCache()
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
			style={mainStyles.mainContainer(insets)}
			refreshControl={(Platform.OS === 'ios' || Platform.OS === 'android') ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primaryLight} /> : null}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 20 }}>
				<TouchableOpacity style={styles.boxRandom} onPress={clickRandomSong}>
					<Text style={styles.textRandom}>Random Song</Text>
				</TouchableOpacity>
				{statusRefresh ?
					<Text style={mainStyles.subTitle}>
						{statusRefresh.count}°
					</Text> :
					<IconButton
						icon="refresh"
						size={30}
						color={theme.primaryLight}
						style={{ paddingHorizontal: 10 }}
						onPress={refreshServer}
					/>}
			</View>
			{config?.url && settings.homeOrder.map((value, index) =>
				<HorizontalAlbumList key={index} config={config} refresh={refreshing} {...value} />
			)}
		</ScrollView>
	);
}

const styles = {
	boxRandom: {
		backgroundColor: theme.secondaryTouch,
		alignItems: 'center',
		padding: 7,
		paddingHorizontal: 15,
		justifyContent: 'center',
		borderRadius: 50,
	},
	textRandom: {
		fontSize: 18,
		color: theme.primaryLight,
		fontWeight: 'bold',
	}
}

export default Home;