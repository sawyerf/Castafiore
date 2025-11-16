import React from 'react'
import { View, Text, Pressable } from 'react-native'

import { ConfigContext } from '~/contexts/config'
import { ThemeContext } from '~/contexts/theme'
import { urlCover } from '~/utils/url'
import { playSong } from '~/utils/player'
import { SongDispatchContext } from '~/contexts/song'
import ImageError from '~/components/ImageError'
import mainStyles from '~/styles/main'
import size from '~/styles/size'

const HorizontalQueue = ({ current, queue }) => {
	const theme = React.useContext(ThemeContext)
	const config = React.useContext(ConfigContext)
	const songDispatch = React.useContext(SongDispatchContext)
	const [currentTrack, setCurrentTrack] = React.useState(null)

	React.useEffect(() => {
		setCurrentTrack(queue?.find(item => current === item.id) || null)
	}, [queue, current])

	if (!queue?.length || !currentTrack) return null
	return (
		<Pressable
			onPress={() => playSong(config, songDispatch, queue, queue.findIndex(item => current === item.id))}
			style={{
				marginHorizontal: 20,
				flexDirection: 'row',
				alignItems: 'center',
				gap: 10,
			}}
		>
			<ImageError
				source={{ uri: urlCover(config, currentTrack) }}
				style={{ height: size.image.medium, width: size.image.medium, borderRadius: 5 }}
			/>
			<View style={{ flex: 1, gap: 5 }}>
				<Text style={mainStyles.mediumText(theme.primaryText)} numberOfLines={1}>
					{currentTrack.title}
				</Text>
				<Text style={mainStyles.smallText(theme.secondaryText)} numberOfLines={1}>
					{currentTrack.artist}
				</Text>
			</View>
			<Text style={mainStyles.smallText(theme.secondaryText)}>+ {queue.length - 1}</Text>
		</Pressable>
	)
}

export default HorizontalQueue