import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext } from '~/contexts/config';
import { playSong } from '~/utils/player';
import { SongDispatchContext } from '~/contexts/song';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import IconButton from '~/components/button/IconButton';
import ImageError from '~/components/ImageError';
import mainStyles from '~/styles/main';
import size from '~/styles/size';

const HistoryItem = ({ itemHist, index, setQuery, delItemHistory }) => {
	const songDispatch = React.useContext(SongDispatchContext)
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
		<Pressable key={index} onPress={handlePress} style={({ pressed }) => ([mainStyles.opacity({ pressed }), {
			marginHorizontal: 20,
			flexDirection: 'row',
			alignItems: 'center',
			paddingVertical: typeof itemHist === 'object' ? 0 : 6,
		}])}>
			{
				typeof itemHist === 'object' ? (
					<>
						<ImageError
							source={{ uri: urlCover(config, itemHist.albumId || itemHist.id, 100) }}
							style={{
								width: 45,
								height: 45,
								borderRadius: itemHist.mediaType ? 3 : size.radius.circle,
								marginEnd: 10,
								backgroundColor: theme.secondaryDark,
							}}
						/>
						<View style={{ flex: 1, flexDirection: 'column' }}>
							<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: size.text.small, marginBottom: 2 }}> {itemHist.name || itemHist.title}</Text>
							<Text numberOfLines={1} style={{ color: theme.secondaryLight, fontSize: size.text.small }}>{itemHist.mediaType || 'artist'} · {itemHist.artist}</Text>
						</View>
					</>
				) : (
					<>
						<Icon name="eye" size={17} color={theme.secondaryLight} style={{ width: 45, marginEnd: 10, textAlign: 'center' }} />
						<Text style={{ color: theme.secondaryLight, fontSize: size.text.medium }}>{itemHist}</Text>
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