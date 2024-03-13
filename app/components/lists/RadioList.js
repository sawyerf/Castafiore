import React from 'react'
import { ScrollView, View, Text, Image, TouchableOpacity, Linking } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

import { ThemeContext } from '~/contexts/theme'
import { SongContext } from '~/contexts/song';
import { playSong } from '~/utils/player';
import OptionsPopup from '~/components/popup/OptionsPopup';
import { getApi } from '~/utils/api';
import ImageError from '~/components/ImageError';

const RadioList = ({ config, radios }) => {
	const [song, songDispatch] = React.useContext(SongContext)
	const [optionRadio, setOptionRadio] = React.useState(null)
	const navigation = useNavigation()
	const theme = React.useContext(ThemeContext)

	const playRadio = (index) => {
		playSong(config, song, songDispatch, radios.map(radio => ({
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

	if (!radios) return null
	return (
		<ScrollView
			horizontal={true}
			vertical={false}
			style={{
				width: '100%',
			}}
			contentContainerStyle={{
				height: 60 * 2 + 10,
				paddingStart: 20,
				paddingEnd: 20,
				flexDirection: 'column',
				flexWrap: 'wrap',
				columnGap: 10,
				rowGap: 10,
			}}
		>
			{radios.map((radio, index) => {
				const getUrlFavicon = (url) => {
					if (!url) return null
					const regex = url.match(new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im'))
					if (!regex) return null
					const origin = regex[0]
					return origin + '/favicon.ico'
				}

				return (
					<TouchableOpacity
						key={index}
						onPress={() => playRadio(index)}
						onLongPress={() => setOptionRadio(radio)}
						delayLongPress={200}
						style={styles.cardRadio(theme)}
					>
						<ImageError
							source={{ uri: getUrlFavicon(radio.homePageUrl) }}
							style={styles.image} >
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
						<View style={{ flexDirection: 'column' }} >
							<Text
								numberOfLines={1}
								style={{
									color: theme.primaryLight,
									fontSize: 16,
									maxWidth: 275,
									fontWeight: 'bold',
									overflow: 'hidden',
								}}
							>
								{radio.name}
							</Text>
							{radio.homePageUrl && <Text
								numberOfLines={1}
								style={{
									color: theme.secondaryLight,
									maxWidth: 275,
									fontSize: 16,
									overflow: 'hidden',
								}}
							>
								{radio.homePageUrl}
							</Text>}
						</View>
					</TouchableOpacity>
				)
			})}
			<TouchableOpacity
				onPress={() => navigation.navigate('UpdateRadio')}
				delayLongPress={200}
				style={styles.cardRadio}
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
		</ScrollView>
	)
}

const styles = {
	cardRadio: theme => ({
		height: 60,
		minWidth: 200,
		// marginEnd: 10,
		// marginBottom: 10,
		padding: 10,
		paddingEnd: 20,
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