import React from 'react';

import { SettingsContext } from '~/contexts/settings';
import { SongContext } from '~/contexts/song';
import { updateTime } from '~/utils/player';
import BoxPlayer from './BoxPlayer';
import FullScreenPlayer from './FullScreenPlayer';
import BoxDesktopPlayer from './BoxDesktopPlayer';

const Player = ({ state, fullscreen }) => {
	const [song, songDispatch] = React.useContext(SongContext)
	const settings = React.useContext(SettingsContext)
	const [time, setTime] = React.useState(null)

	React.useEffect(() => {
		return updateTime(setTime)
	}, [])

	React.useEffect(() => {
		fullscreen.set(false)
	}, [state.index])

	if (!song?.songInfo) return null
	else if (fullscreen.value) return <FullScreenPlayer fullscreen={fullscreen} time={time ? time : song} />
	else if (settings.isDesktop) return <BoxDesktopPlayer fullscreen={fullscreen} time={time ? time : song} />
	return <BoxPlayer fullscreen={fullscreen} />
}

export default Player;