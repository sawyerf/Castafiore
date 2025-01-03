import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext } from '~/contexts/config';
import { urlCover } from '~/utils/api';
import { playSong } from '~/utils/player';
import { SongContext } from '~/contexts/song';
import { ThemeContext } from '~/contexts/theme';
import IconButton from '~/components/button/IconButton';
import ImageError from '~/components/ImageError';

const HistoryItem = ({ itemHist, index, setQuery, delItemHistory }) => {
	const [_, songDispatch] = React.useContext(SongContext)
	const config = React.useContext(ConfigContext)
	const navigation = useNavigation()
	const theme = React.useContext(ThemeContext)

	const handlePress = () => {
		if (typeof itemHist === 'string') {
			setQuery(itemHist)
		} else if (itemHist.mediaType === 'song') {
			playSong(config, songDispatch, [itemHist], 0)
		} else if (itemHist.mediaType === 'album') {
			navigation.navigate('Album', { album: itemHist })
		} else if (itemHist.artistImageUrl) {
			navigation.navigate('Artist', { artist: itemHist })
		}
	}

	return (
		<Pressable key={index} onPress={handlePress} style={({ pressed }) => ({
			marginHorizontal: 20,
			flexDirection: 'row',
			alignItems: 'center',
			opacity: pressed ? 0.5 : 1,
			paddingVertical: typeof itemHist === 'object' ? 0 : 6,
		})}>
			{
				typeof itemHist === 'object' ? (
					<>
						<ImageError
							source={{ uri: urlCover(config, itemHist.id, 100) }}
							style={{
								width: 45,
								height: 45,
								borderRadius: itemHist.mediaType ? 3 : '50%',
								marginEnd: 10,
								backgroundColor: theme.secondaryDark,
							}}
						/>
						<View style={{ flex: 1, flexDirection: 'column' }}>
							<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: 13, marginBottom: 2 }}> {itemHist.name || itemHist.title}</Text>
							<Text numberOfLines={1} style={{ color: theme.secondaryLight, fontSize: 13 }}> {itemHist.mediaType || 'artist'} · {itemHist.artist}</Text>
						</View>
					</>
				) : (
					<>
						<Icon name="eye" size={17} color={theme.secondaryLight} style={{ width: 45, marginEnd: 10, textAlign: 'center' }} />
						<Text style={{ color: theme.secondaryLight, fontSize: 17 }}>{itemHist}</Text>
					</>
				)
			}
			<IconButton
				icon="times"
				size={14}
				color={theme.secondaryLight}
				style={{ position: 'absolute', top: 0, right: 0, height: '100%', justifyContent: 'center', paddingHorizontal: 10 }}
				onPress={() => delItemHistory(index)}
			/>
		</Pressable>
	)
}

export default HistoryItem