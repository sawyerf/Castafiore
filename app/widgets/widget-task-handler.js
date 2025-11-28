import React from 'react'
import TrackPlayer, { State } from 'react-native-track-player'
import FavoritedWidget from '~/widgets/FavoritedWidget'
import PlayerWidget from '~/widgets/PlayerWidget'

export const nameToWidget = {
	Favorited: FavoritedWidget,
	Player: PlayerWidget,
}

const renderWidget = async (props) => {
	const widgetInfo = props.widgetInfo
	const Widget =
		nameToWidget[widgetInfo.widgetName]

	if (widgetInfo.widgetName === 'Player') {
		const activateTrack = await TrackPlayer.getActiveTrack()
		if (activateTrack == null) {
			return
		}
		const isPlaying = (await TrackPlayer.getPlaybackState()).state === State.Playing
		return props.renderWidget(<Widget {...widgetInfo} coverUrl={activateTrack.artwork} isPlaying={isPlaying} />)
	} else {
		props.renderWidget(<Widget {...widgetInfo} />)
	}
}

const widgetTaskHandler = async (props) => {
	switch (props.widgetAction) {
		case 'WIDGET_ADDED':
			await renderWidget(props)
			break

		case 'WIDGET_UPDATE':
			// Not needed for now
			break

		case 'WIDGET_RESIZED':
			// Not needed for now
			break

		case 'WIDGET_DELETED':
			// Not needed for now
			break

		case 'WIDGET_CLICK':
			switch (props.clickAction) {
				case 'PLAY_ACTION':
					await TrackPlayer.play()
					await renderWidget(props)
					break
				case 'PAUSE_ACTION':
					await TrackPlayer.pause()
					await renderWidget(props)
					break
				case 'NEXT_ACTION':
					// await TrackPlayer.skipToNext()
					break
				case 'PREV_ACTION':
					// await TrackPlayer.skipToPrevious()
					break
				default:
					break
			}
			break

		default:
			break
	}
}

export default widgetTaskHandler