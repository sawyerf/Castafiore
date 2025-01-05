import React from 'react';
import { useWindowDimensions } from 'react-native';

import { SettingsContext } from '~/contexts/settings';
import { SongContext } from '~/contexts/song';
import BoxDesktopPlayer from './BoxDesktopPlayer';
import BoxPlayer from './BoxPlayer';
import FullScreenHorizontalPlayer from './FullScreenHorizontalPlayer';
import FullScreenPlayer from './FullScreenPlayer';

const Player = ({ state, fullscreen }) => {
	const song = React.useContext(SongContext)
	const settings = React.useContext(SettingsContext)
	const { height, width } = useWindowDimensions()

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