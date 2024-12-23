import React from 'react';

import { ConfigContext } from '~/contexts/config';
import { SettingsContext } from '~/contexts/settings';
import { SongContext } from '~/contexts/song';
import { nextSong, handleAction, pauseSong, resumeSong, previousSong, setVolume } from '~/utils/player';
import BoxPlayer from './BoxPlayer';
import FullScreenPlayer from './FullScreenPlayer';
import BoxDesktopPlayer from './BoxDesktopPlayer';
import { getVolume } from '../../utils/player.web';

const Player = ({ state, fullscreen }) => {
	const [song, songDispatch] = React.useContext(SongContext)
	const config = React.useContext(ConfigContext)
	const settings = React.useContext(SettingsContext)
	const [time, setTime] = React.useState(null)

	React.useEffect(() => {
		return handleAction(config, song, songDispatch, setTime)
	}, [song.songInfo, song.index, song.queue, song.actionEndOfSong])

	React.useEffect(() => {
		fullscreen.set(false)
	}, [state.index])

	React.useEffect(() => {
		addEventListener('keydown', onKeyEvent)
		return () => removeEventListener('keydown', onKeyEvent)
	}, [song.isPlaying, song.songInfo, song.index, song.queue, song.actionEndOfSong])

	const onKeyEvent = (e) => {
		if (e.code === 'Space') {
			if (song.isPlaying) pauseSong()
			else resumeSong()
		} else if (e.code === 'ArrowRight') nextSong(config, song, songDispatch)
		else if (e.code === 'ArrowLeft') previousSong(config, song, songDispatch)
		else if (e.code === 'ArrowUp') setVolume(getVolume() + 0.1)
		else if (e.code === 'ArrowDown') setVolume(getVolume() - 0.1)
	}

	if (!song?.songInfo) return null
	else if (fullscreen.value) return <FullScreenPlayer fullscreen={fullscreen} time={time ? time : song} />
	else if (settings.isDesktop) return <BoxDesktopPlayer fullscreen={fullscreen} time={time ? time : song} />
	return <BoxPlayer fullscreen={fullscreen} />
}

export default Player;