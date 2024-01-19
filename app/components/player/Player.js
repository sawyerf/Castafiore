import React from 'react';
import { Platform } from 'react-native';
import { SongContext } from '~/contexts/song';
import { nextSong, handleAction } from '~/utils/player';

import { ConfigContext } from '~/contexts/config';
import { getApi } from '~/utils/api';
import BoxPlayer from './BoxPlayer';
import FullScreenPlayer from './FullScreenPlayer';

const Player = ({ navigation, state, fullscreen }) => {
	const [song, songDispatch] = React.useContext(SongContext)
	const config = React.useContext(ConfigContext)
	const [time, setTime] = React.useState(null)

	React.useEffect(() => {
		if (!song.sound) return
		return handleAction(config, song, songDispatch, setTime)
	}, [song.sound, song.songInfo, song.index, song.queue, song.actionEndOfSong])

	React.useEffect(() => {
		fullscreen.set(false)
	}, [state.index])

	if (!song?.songInfo) return null
	if (fullscreen.value) return <FullScreenPlayer fullscreen={fullscreen} time={time ? time : song} />
	else return <BoxPlayer fullscreen={fullscreen} />
}

export default Player;