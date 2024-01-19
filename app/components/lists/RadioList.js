import React from 'react'
import { ScrollView, View, Text, Image, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';

import theme from '~/utils/theme'
import { SongContext } from '~/contexts/song';
import { playSong } from '~/utils/player';
import OptionsPopup from '~/components/popup/OptionsPopup';
import { getApi } from '~/utils/api';

const RadioList = ({ config, radios }) => {
	const [song, songDispatch] = React.useContext(SongContext)
	const [optionRadio, setOptionRadio] = React.useState(null)

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
				height: 70 * 2,
			}}
			contentContainerStyle={{
				height: '100%',
				paddingStart: 20,
				flexDirection: 'column',
				flexWrap: 'wrap',
			}}
		>
			{radios.map((radio, index) => {
				const getUrlFavicon = (url) => {
					if (!url) return null
					const reg = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im')
					const origin = url.match(reg)[0]
					return origin + '/favicon.ico'
				}

				return (
					<TouchableOpacity
						key={index}
						onPress={() => playRadio(index)}
						onLongPress={() => setOptionRadio(radio)}
						delayLongPress={200}
						style={{
							height: 60,
							minWidth: 200,
							marginEnd: 10,
							marginBottom: 10,
							padding: 10,
							paddingEnd: 20,
							backgroundColor: theme.secondaryDark,
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'flex-start',
							borderRadius: 7,
						}}
					>
						<Icon
							name="feed"
							size={32}
							color={theme.primaryLight}
							style={{
								position: 'absolute',
								left: 20,
							}}
						/>
						<Image
							source={{ uri: getUrlFavicon(radio.homePageUrl) }}
							style={{
								height: '100%',
								aspectRatio: 1,
								borderRadius: 3,
								marginRight: 10,
							}}
						/>
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
									maxWidth: 300,
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
			<OptionsPopup
				visible={optionRadio !== null}
				close={() => { setOptionRadio(null) }}
				options={[
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

export default RadioList;