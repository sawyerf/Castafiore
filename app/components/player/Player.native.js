import React from 'react';

import { SettingsContext } from '~/contexts/settings';
import { SongContext } from '~/contexts/song';
import BoxPlayer from './BoxPlayer';
import FullScreenPlayer from './FullScreenPlayer';
import BoxDesktopPlayer from './BoxDesktopPlayer';
import { useProgress, Event, useTrackPlayerEvents, State } from 'react-native-track-player';

const events = [
  Event.PlaybackState,
	Event.PlaybackActiveTrackChanged,
];

const Player = ({ state, fullscreen }) => {
	const [song, songDispatch] = React.useContext(SongContext)
	const settings = React.useContext(SettingsContext)
	const progress = useProgress(500)

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
	else if (fullscreen.value) return <FullScreenPlayer fullscreen={fullscreen} time={progress} />
	else if (settings.isDesktop) return <BoxDesktopPlayer fullscreen={fullscreen} time={progress} />
	return <BoxPlayer fullscreen={fullscreen} />
}

export default Player;