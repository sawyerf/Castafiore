import React from 'react'
import { Text, View, ScrollView, Animated, StyleSheet, Pressable, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { ConfigContext } from '~/contexts/config'
import { getApi, getApiNetworkFirst } from '~/utils/api'
import { playSong } from '~/utils/player'
import { SettingsContext } from '~/contexts/settings'
import { SongDispatchContext } from '~/contexts/song'
import { ThemeContext } from '~/contexts/theme'
import HorizontalList from '~/components/lists/HorizontalList'
import IconButton from '~/components/button/IconButton'
import mainStyles from '~/styles/main'
import size from '~/styles/size'

const Home = () => {
	const { t } = useTranslation()
	const navigation = useNavigation()
	const insets = useSafeAreaInsets()
	const songDispatch = React.useContext(SongDispatchContext)
	const config = React.useContext(ConfigContext)
	const settings = React.useContext(SettingsContext)
	const theme = React.useContext(ThemeContext)
	const [statusRefresh, setStatusRefresh] = React.useState()
	const [refresh, setRefresh] = React.useState(0)
	const rotationValue = React.useRef(new Animated.Value(0)).current
	const rotation = rotationValue.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '360deg']
	})

	const clickRandomSong = () => {
		getApiNetworkFirst(config, 'getRandomSongs', `size=50`)
			.then((json) => {
				playSong(config, songDispatch, json.randomSongs.song, 0)
			})
			.catch(() => { })
	}

	const forceRefresh = () => {
		setRefresh(refresh + 1)
		rotationValue.setValue(0)
		Animated.timing(rotationValue, {
			toValue: 1,
			duration: 1000,
			useNativeDriver: Platform.OS !== 'web',
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
			.catch(() => { })
	}

	const refreshServer = () => {
		forceRefresh()
		getApi(config, 'startScan', 'fullScan=true')
			.then(() => {
				getStatusRefresh()
			})
			.catch(() => { })
	}

	return (
		<ScrollView vertical={true}
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 20 }}>
				<Pressable
					style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.boxRandom(theme)])}
					onPress={clickRandomSong}>
					<Text style={styles.textRandom(theme)}>{t('Random Song')}</Text>
				</Pressable>
				<View style={{ flexDirection: 'row' }}>
					{
						settings.listenBrainzUser ?
							<IconButton
								icon="bell-o"
								size={size.icon.tiny}
								color={theme.primaryText}
								style={{ paddingHorizontal: 10, paddingVertical: 5 }}
								onPress={() => navigation.navigate('FreshReleases')}
							/> : null
					}
					{statusRefresh ?
						<Pressable onPress={forceRefresh} style={mainStyles.opacity}>
							<Text style={mainStyles.subTitle(theme)}>
								{statusRefresh.count}°
							</Text>
						</Pressable> :
						<Animated.View style={{ transform: [{ rotate: rotation }] }}>
							<IconButton
								icon="refresh"
								size={size.icon.large}
								color={theme.primaryText}
								style={{ paddingHorizontal: 10 }}
								onPress={forceRefresh}
								onLongPress={refreshServer}
								delayLongPress={200}
							/>
						</Animated.View>
					}
				</View>
			</View>
			{config?.url && settings?.homeOrderV2?.map((value, index) =>
				<HorizontalList key={index} refresh={refresh}{...value} />
			)}
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	boxRandom: theme => ({
		backgroundColor: theme.secondaryTouch,
		alignItems: 'center',
		padding: 7,
		paddingHorizontal: 15,
		justifyContent: 'center',
		borderRadius: size.radius.circle,
	}),
	textRandom: theme => ({
		fontSize: 18,
		color: theme.innerTouch,
		fontWeight: 'bold',
	}),
})

export default Home