import React from 'react'
import { View, Text, Linking, StyleSheet, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext } from '~/contexts/config';
import { getApi } from '~/utils/api';
import { playSong } from '~/utils/player';
import { SongDispatchContext } from '~/contexts/song';
import { ThemeContext } from '~/contexts/theme'
import CustomFlat from '~/components/lists/CustomFlat';
import ImageError from '~/components/ImageError';
import OptionsPopup from '~/components/popup/OptionsPopup';
import size from '~/styles/size';
import mainStyles from '~/styles/main';

const RadioList = ({ radios }) => {
	const theme = React.useContext(ThemeContext)
	const config = React.useContext(ConfigContext)
	const songDispatch = React.useContext(SongDispatchContext)
	const [optionRadio, setOptionRadio] = React.useState(null)
	const navigation = useNavigation()

	const playRadio = React.useCallback((index) => {
		playSong(config, songDispatch, radios.map(radio => ({
			id: radio.streamUrl,
			title: radio.name,
			artist: radio.homePageUrl ? radio.homePageUrl : 'Radio',
			albumId: radio.id,
			starred: false,
			discNumber: 1,
			duration: 0,
			albumArtist: radio.homePageUrl,
		})), index)
	})

	const getUrlFavicon = React.useCallback((url) => {
		if (!url) return null
		const regex = url.match(new RegExp('^(?:f|ht)tp(?:s)?://([^/]+)', 'im'))
		if (!regex) return null
		const origin = regex[0]
		return origin + '/favicon.ico'
	})

	if (!radios) return null
	return (
		<>
			<CustomFlat
				contentContainerStyle={{
					height: 60 * 2 + 10,
					paddingStart: 20,
					paddingEnd: 20,
					flexDirection: 'column',
					flexWrap: 'wrap',
					columnGap: 10,
					rowGap: 10,
				}}
				data={[...radios, { lastItem: true }]}
				renderItem={({ item, index }) => {
					if (item.lastItem) return (
						<Pressable
							onPress={() => navigation.navigate('UpdateRadio')}
							delayLongPress={200}
							style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.cardRadio(theme)])}
						>
							<View
								style={[styles.image, {
									alignItems: 'center',
									justifyContent: 'center',
								}]} >
								<Icon name="plus" size={32} color={theme.primaryLight} />
							</View>
							<Text
								numberOfLines={1}
								style={{
									color: theme.primaryLight,
									fontSize: size.text.medium,
									fontWeight: 'bold',
									overflow: 'hidden',
								}}
							>
								Add radio
							</Text>
						</Pressable>
					)

					return (
						<Pressable
							key={index}
							onPress={() => playRadio(index)}
							onLongPress={() => setOptionRadio(item)}
							delayLongPress={200}
							style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.cardRadio(theme)])}
						>
							<ImageError
								source={{ uri: getUrlFavicon(item.homePageUrl) }}
								style={styles.image}>
								<View
									style={[styles.image, {
										alignItems: 'center',
										justifyContent: 'center',
									}]} >
									<Icon
										name="feed"
										size={32}
										style={{ marginTop: 2 }}
										color={theme.primaryLight}
									/>
								</View>
							</ImageError>
							<View style={{ flexDirection: 'column', flex: 1 }} >
								<Text
									numberOfLines={1}
									style={{
										color: theme.primaryLight,
										fontSize: size.text.medium,
										flex: 1,
										fontWeight: 'bold',
									}}
								>
									{item.name}
								</Text>
								{item.homePageUrl && <Text
									numberOfLines={1}
									style={{
										color: theme.secondaryLight,
										fontSize: size.text.medium,
									}}
								>
									{item.homePageUrl}
								</Text>}
							</View>
						</Pressable>
					)
				}}
			/>
			<OptionsPopup
				visible={optionRadio !== null}
				close={() => { setOptionRadio(null) }}
				item={optionRadio}
				options={[
					{
						name: 'Open home page',
						icon: 'home',
						onPress: () => {
							setOptionRadio(null)
							Linking.openURL(optionRadio.homePageUrl)
						}
					},
					{
						name: 'Edit radio',
						icon: 'pencil',
						onPress: () => {
							setOptionRadio(null)
							navigation.navigate('UpdateRadio', { id: optionRadio.id, name: optionRadio.name, streamUrl: optionRadio.streamUrl, homePageUrl: optionRadio.homePageUrl })
						}
					},
					{
						name: 'Remove radio',
						icon: 'trash-o',
						onPress: () => {
							getApi(config, 'deleteInternetRadioStation', `id=${optionRadio.id}`)
								.then(() => {
									setOptionRadio(null)
									radios.splice(radios.indexOf(optionRadio), 1)
								})
								.catch(() => { })
						}
					}
				]}
			/>
		</>
	)
}

const styles = StyleSheet.create({
	cardRadio: theme => ({
		height: 60,
		width: 300,
		padding: 10,
		backgroundColor: theme.secondaryDark,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-start',
		borderRadius: 7,
	}),
	image: {
		height: '100%',
		aspectRatio: 1,
		marginRight: 10,
		borderRadius: 3,
	},
})

export default RadioList;