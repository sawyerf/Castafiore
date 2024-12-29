import React from 'react'
import { View, Text, TouchableOpacity, Linking } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

import { ThemeContext } from '~/contexts/theme'
import { SongContext } from '~/contexts/song';
import { playSong } from '~/utils/player';
import OptionsPopup from '~/components/popup/OptionsPopup';
import { getApi } from '~/utils/api';
import ImageError from '~/components/ImageError';
import CustomScroll from '~/components/lists/CustomScroll';

const RadioList = ({ config, radios }) => {
	const [song, songDispatch] = React.useContext(SongContext)
	const [optionRadio, setOptionRadio] = React.useState(null)
	const navigation = useNavigation()
	const theme = React.useContext(ThemeContext)

	const playRadio = (index) => {
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
	}

	const getUrlFavicon = (url) => {
		if (!url) return null
		const regex = url.match(new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im'))
		if (!regex) return null
		const origin = regex[0]
		return origin + '/favicon.ico'
	}

	if (!radios) return null
	return (
		<>
			<CustomScroll
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
						<TouchableOpacity
							onPress={() => navigation.navigate('UpdateRadio')}
							delayLongPress={200}
							style={styles.cardRadio(theme)}
						>
							<View
								style={{
									...styles.image,
									alignItems: 'center',
									justifyContent: 'center',
								}} >
								<Icon name="plus" size={32} color={theme.primaryLight} />
							</View>
							<Text
								numberOfLines={1}
								style={{
									color: theme.primaryLight,
									fontSize: 16,
									fontWeight: 'bold',
									overflow: 'hidden',
								}}
							>
								Add radio
							</Text>
						</TouchableOpacity>
					)

					return (
						<TouchableOpacity
							key={index}
							onPress={() => playRadio(index)}
							onLongPress={() => setOptionRadio(item)}
							delayLongPress={200}
							style={styles.cardRadio(theme)}
						>
							<ImageError
								source={{ uri: getUrlFavicon(item.homePageUrl) }}
								style={styles.image}>
								<View
									style={{
										...styles.image,
										alignItems: 'center',
										justifyContent: 'center',
									}} >
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
										fontSize: 16,
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
										fontSize: 16,
									}}
								>
									{item.homePageUrl}
								</Text>}
							</View>
						</TouchableOpacity>
					)
				}}
			/>
			<OptionsPopup
				visible={optionRadio !== null}
				close={() => { setOptionRadio(null) }}
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
								.then((json) => {
									setOptionRadio(null)
									radios.splice(radios.indexOf(optionRadio), 1)
								})
								.catch((error) => { })
						}
					}
				]}
			/>
		</>
	)
}

const styles = {
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
}

export default RadioList;