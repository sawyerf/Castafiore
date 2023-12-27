import React from 'react';
import { Text, View, ScrollView, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/utils/config';
import { SettingsContext } from '~/utils/settings';
import { SoundContext, playSong } from '~/utils/player';
import { getApi } from '~/utils/api';
import mainStyles from '~/styles/main';
import theme from '~/utils/theme';
import HorizontalList from '~/components/HorizontalList';
import IconButton from '~/components/button/IconButton';

const Home = ({ navigation }) => {
	const insets = useSafeAreaInsets();
	const sound = React.useContext(SoundContext)
	const config = React.useContext(ConfigContext)
	const settings = React.useContext(SettingsContext)
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
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
			// refreshControl={(Platform.OS === 'ios' || Platform.OS === 'android') ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primaryLight} /> : null}
		>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 20 }}>
				<TouchableOpacity style={styles.boxRandom}
					onPress={clickRandomSong}>
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
						onLongPress={refreshServer}
						delayLongPress={200}
						onPress={() => setRefreshing(true)}
					/>}
			</View>
			{config?.url && settings?.homeOrder?.map((value, index) =>
				<HorizontalList key={index} config={config} refresh={refreshing} {...value} />
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