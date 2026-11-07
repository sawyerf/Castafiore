import React from 'react'
import { Text, View, ScrollView, StyleSheet, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { useConfig } from '~/contexts/config'
import { getApiNetworkFirst } from '~/utils/api'
import { playSong } from '~/utils/player'
import { useSettings } from '~/contexts/settings'
import { useSongDispatch } from '~/contexts/song'
import { useTheme } from '~/contexts/theme'
import Icon from '~/components/Icon'
import RotateIconButton from '~/components/button/RotateIconButton'
import HorizontalList from '~/components/lists/HorizontalList'
import IconButton from '~/components/button/IconButton'
import mainStyles from '~/styles/main'
import size from '~/styles/size'

const Home = () => {
	const { t } = useTranslation()
	const navigation = useNavigation()
	const insets = useSafeAreaInsets()
	const songDispatch = useSongDispatch()
	const config = useConfig()
	const settings = useSettings()
	const theme = useTheme()
	const [refresh, setRefresh] = React.useState(0)

	const clickRandomSong = () => {
		getApiNetworkFirst(config, 'getRandomSongs', 'size=50')
			.then((json) => {
				playSong(config, songDispatch, json.randomSongs.song, 0)
			})
			.catch(() => { })
	}

	const forceRefresh = (rotate = () => { }) => {
		setRefresh(refresh + 1)
		rotate()
	}

	return (
		<ScrollView vertical={true}
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginTop: 20 }}>
				<Text style={[mainStyles.mainTitle(theme), { margin: 0 }]}>{t('tabs.Home')}</Text>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					{
						settings.listenBrainzUser ?
							<IconButton
								icon="bell-o"
								size={size.icon.small}
								color={theme.primaryText}
								style={{ paddingHorizontal: 10, paddingVertical: 5 }}
								onPress={() => navigation.navigate('FreshReleases')}
							/> : null
					}
					<RotateIconButton
						icon="refresh"
						size={size.icon.small}
						color={theme.primaryText}
						style={{ paddingHorizontal: 10 }}
						onPress={forceRefresh}
					/>
				</View>
			</View>
			<View style={{ flexDirection: 'row', margin: 20, marginBottom: 0 }}>
				<Pressable
					accessibilityRole="button"
					style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.boxRandom(theme)])}
					onPress={clickRandomSong}>
					<Icon name="random" size={size.icon.tiny} color={theme.innerTouch} />
					<Text style={styles.textRandom(theme)}>{t('Random Song')}</Text>
				</Pressable>
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
		flexDirection: 'row',
		gap: 8,
		padding: 7,
		paddingHorizontal: 15,
		justifyContent: 'center',
		borderRadius: size.radius.circle,
	}),
	textRandom: theme => ({
		fontSize: size.text.large,
		color: theme.innerTouch,
		fontWeight: 'bold',
	}),
})

export default Home