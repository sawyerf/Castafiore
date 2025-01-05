import React from 'react';
import { Event, useTrackPlayerEvents, State } from 'react-native-track-player';

import { SettingsContext } from '~/contexts/settings';
import { SongContext, SongDispatchContext } from '~/contexts/song';
import BoxPlayer from './BoxPlayer';
import FullScreenPlayer from './FullScreenPlayer';
import BoxDesktopPlayer from './BoxDesktopPlayer';

const events = [
	Event.PlaybackState,
	Event.PlaybackActiveTrackChanged,
];

const Player = ({ state, fullscreen }) => {
	const song = React.useContext(SongContext)
	const songDispatch = React.useContext(SongDispatchContext)
	const settings = React.useContext(SettingsContext)
	const { height, width } = useWindowDimensions()

	useTrackPlayerEvents(events, async (event) => {
		if (event.type === Event.PlaybackState) {
			songDispatch({ type: 'setPlaying', isPlaying: event.state !== State.Paused })
		} else if (event.type === Event.PlaybackActiveTrackChanged) {
			songDispatch({ type: 'setIndex', index: event.index })
		}
	})

	React.useEffect(() => {
		fullscreen.set(false)
	}, [state.index])

	if (!song?.songInfo) return null
	else if (fullscreen.value) {
		if (width <= height) return <FullScreenPlayer fullscreen={fullscreen} />
		else return <FullScreenHorizontalPlayer fullscreen={fullscreen} />
	}
	else if (settings.isDesktop) return <BoxDesktopPlayer fullscreen={fullscreen} />
	return <BoxPlayer fullscreen={fullscreen} />
}

export default Player;