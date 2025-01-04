import React from 'react';

import { SettingsContext } from '~/contexts/settings';
import { SongContext } from '~/contexts/song';
import BoxPlayer from './BoxPlayer';
import FullScreenPlayer from './FullScreenPlayer';
import BoxDesktopPlayer from './BoxDesktopPlayer';

const Player = ({ state, fullscreen }) => {
	const song = React.useContext(SongContext)
	const settings = React.useContext(SettingsContext)

	React.useEffect(() => {
		fullscreen.set(false)
	}, [state.index])

	if (!song?.songInfo) return null
	else if (fullscreen.value) return <FullScreenPlayer fullscreen={fullscreen} />
	else if (settings.isDesktop) return <BoxDesktopPlayer fullscreen={fullscreen} />
	return <BoxPlayer fullscreen={fullscreen} />
}

export default Player;