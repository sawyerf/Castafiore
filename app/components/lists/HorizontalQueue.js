import React from 'react'
import { View, Text, Pressable } from 'react-native'

import { ConfigContext } from '~/contexts/config'
import { ThemeContext } from '~/contexts/theme'
import { urlCover } from '~/utils/url'
import { playSong } from '~/utils/player'
import { SongDispatchContext } from '~/contexts/song'
import { SettingsContext } from '~/contexts/settings'
import ImageError from '~/components/ImageError'
import mainStyles from '~/styles/main'
import size from '~/styles/size'

const HorizontalQueue = ({ current, queue }) => {
	const theme = React.useContext(ThemeContext)
	const config = React.useContext(ConfigContext)
	const songDispatch = React.useContext(SongDispatchContext)
	const [currentTrack, setCurrentTrack] = React.useState(null)
	const settings = React.useContext(SettingsContext)
	const [isHovered, setIsHovered] = React.useState(false)

	React.useEffect(() => {
		setCurrentTrack(queue?.find(item => current === item.id) || null)
	}, [queue, current])

	if (!queue?.length || !currentTrack) return null
	return (
		<Pressable
			onPress={() => playSong(config, songDispatch, queue, queue.findIndex(item => current === item.id))}
			onHoverIn={() => setIsHovered(settings.isDesktop)}
			onHoverOut={() => setIsHovered(false)}
			style={{
				position: 'relative',
				backgroundColor: isHovered ? theme.secondaryBack : 'transparent',
				marginHorizontal: 20,
				padding: settings.isDesktop ? 15 : undefined,
				borderWidth: settings.isDesktop ? 1 : 0,
				borderColor: settings.isDesktop ? theme.secondaryBack : 'transparent',
				flexDirection: 'row',
				alignItems: 'center',
				gap: 10,
				borderRadius: 5,
				overflow: 'hidden'
			}}
		>
			{
				settings.isDesktop ?
					<ImageError
						source={{ uri: urlCover(config, currentTrack) }}
						blurRadius={10}
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							bottom: 0,
							right: 0,
							borderRadius: 5,
							opacity: 0.2
						}}
					/> : null
			}
			<ImageError
				source={{ uri: urlCover(config, currentTrack) }}
				style={{
					height: settings.isDesktop ? size.image.large : size.image.medium,
					width: settings.isDesktop ? size.image.large : size.image.medium,
					borderRadius: 5
				}}
			/>
			<View style={{ flex: 1, gap: 5 }}>
				<Text style={[mainStyles.mediumText(theme.primaryText), { fontSize: settings.isDesktop ? size.text.large : undefined }]} numberOfLines={1}>
					{currentTrack.title}
				</Text>
				<Text style={[mainStyles.smallText(theme.secondaryText), { fontSize: settings.isDesktop ? size.text.medium : undefined }]} numberOfLines={1}>
					{currentTrack.artist}
				</Text>
			</View>
			<Text style={mainStyles.smallText(theme.secondaryText)}>+ {queue.length - 1}</Text>
		</Pressable>
	)
}

export default HorizontalQueue