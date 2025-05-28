import React from 'react'
import { Text, View, Pressable, Image, StyleSheet, ScrollView } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useCachedAndApi, urlCover } from '~/utils/api'
import { ConfigContext } from '~/contexts/config'
import { ThemeContext } from '~/contexts/theme'
import pkg from '~/../package.json'
import size from '~/styles/size'
import mainStyles from '~/styles/main'
import ImageError from '~/components/ImageError'

const SideBar = ({ state, descriptors, navigation }) => {
	const insets = useSafeAreaInsets()
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const [hoverIndex, setHoverIndex] = React.useState(-1)
	const [refresh, setRefresh] = React.useState(0)

	const [playlists] = useCachedAndApi([], 'getPlaylists', null, (json, setData) => {
		setData(json.playlists.playlist)
	}, [refresh])

	return (
		<View style={styles.container(insets, theme)}>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					width: '100%',
					marginHorizontal: 10,
					marginTop: 15,
					marginBottom: 15,
				}}>
				<Image
					source={require('~/../assets/icon.png')}
					style={mainStyles.icon}
				/>
				<View style={{ flexDirection: 'column', justifyContent: 'center' }}>
					<Text style={{ color: theme.primaryText, fontSize: size.text.large, marginBottom: 0 }}>Castafiore</Text>
					<Text style={{ color: theme.secondaryText, fontSize: size.text.small }}>Version {pkg.version}</Text>
				</View>
			</View>
			{state.routes.map((route, index) => {
				const options = React.useMemo(() => descriptors[route.key].options, [])
				const isFocused = React.useMemo(() => state.index === index, [state.index, index])
				const color = React.useMemo(() => {
					if (isFocused) return theme.primaryTouch
					if (!config.query && route.name !== 'Settings') return theme.secondaryText
					return theme.primaryText
				}, [isFocused, config.query, route.name, theme])

				const onPress = () => {
					const event = navigation.emit({
						type: 'tabPress',
						target: route.key,
						canPreventDefault: true,
					})

					if (!isFocused && !event.defaultPrevented) {
						navigation.navigate(route.name, route.params)
					}
				}

				const onLongPress = () => {
					navigation.emit({
						type: 'tabLongPress',
						target: route.key,
					})
				}

				return (
					<Pressable
						key={index}
						onPress={onPress}
						onLongPress={onLongPress}
						onHoverIn={() => setHoverIndex(index)}
						onHoverOut={() => setHoverIndex(-1)}
						style={({ pressed }) => ([mainStyles.opacity({ pressed }), {
							flexDirection: 'row',
							alignItems: 'center',
							backgroundColor: (isFocused || hoverIndex === index) ? theme.secondaryBack : undefined,
							marginHorizontal: 10,
							paddingVertical: 4,
							paddingLeft: 10,
							borderRadius: 8,
							marginBottom: 3,
						}])}
						disabled={(!config.query && route.name !== 'Settings')}
					>
						<Icon name={options.icon} size={26} color={color} style={{ marginRight: 10 }} />
						<Text style={{ color: color, textAlign: 'left', fontSize: size.text.large, fontWeight: '600' }}>
							{options.title}
						</Text>
					</Pressable>
				)
			})}
			<ScrollView
				showsVerticalScrollIndicator={false}
				style={{
					flex: 1,
					marginTop: 16,
				}}>
				{
					playlists?.filter(playlist => playlist.comment?.includes(`#${config.username}-pin`)).length ?
						<Pressable onPress={() => setRefresh(refresh + 1)}>
							<Text style={[mainStyles.subTitle(theme), { fontSize: 23, marginBottom: 10, marginLeft: 20 }]}>Playlists</Text>
						</Pressable> : null
				}
				{
					playlists?.filter(playlist => playlist.comment?.includes(`#${config.username}-pin`))?.map((item, index) => {
						return (
							<Pressable
								key={index}
								onHoverIn={() => setHoverIndex(index + 4)}
								onHoverOut={() => setHoverIndex(-1)}
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									backgroundColor: (hoverIndex === index + 4) ? theme.secondaryBack : undefined,
									marginHorizontal: 10,
									paddingVertical: 4,
									paddingLeft: 10,
									borderRadius: 8,
									marginBottom: 3,
								}}
								onPress={async () => {
									await navigation.navigate('PlaylistsStack', { screen: 'Playlists' })
									await navigation.navigate('PlaylistsStack', { screen: 'Playlist', params: { playlist: item } })
								}}

							>
								<ImageError
									source={{ uri: urlCover(config, item.id, 100) }}
									style={{ backgroundColor: theme.secondaryBack, width: 40, height: 40, borderRadius: 5 }}
								/>
								<View style={{ flexDirection: 'column', flex: 1 }}>
									<Text
										style={{
											color: theme.primaryText,
											textAlign: 'left',
											fontSize: size.text.medium,
											fontWeight: '600',
											marginLeft: 10,
										}}
										numberOfLines={1}
									>
										{item.name}
									</Text>
									<Text style={{ color: theme.secondaryText, fontSize: size.text.small, marginLeft: 10 }} numberOfLines={1}>
										Playlists
									</Text>
								</View>
							</Pressable>
						)
					})
				}
			</ScrollView>
		</View >
	)
}

const styles = StyleSheet.create({
	container: (insets, theme) => ({
		flexDirection: 'column',
		backgroundColor: theme.primaryBack,
		height: '100%',
		maxHeight: '100vh',
		width: 250,
		paddingLeft: insets.left,
		paddingRight: insets.right,
		borderEndWidth: 1,
		borderEndColor: theme.tertiaryBack,
	}),
})

export default SideBar