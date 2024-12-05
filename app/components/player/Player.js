import React from 'react';
import { Platform, View, Text } from 'react-native';
import { SongContext } from '~/contexts/song';
import { nextSong, handleAction } from '~/utils/player';

import { SettingsContext } from '~/contexts/settings';
import { ConfigContext } from '~/contexts/config';
import { getApi } from '~/utils/api';
import BoxPlayer from './BoxPlayer';
import FullScreenPlayer from './FullScreenPlayer';
import BoxDesktopPlayer from './BoxDesktopPlayer';

const Player = ({ navigation, state, fullscreen }) => {
	const [song, songDispatch] = React.useContext(SongContext)
	const config = React.useContext(ConfigContext)
	const settings = React.useContext(SettingsContext)
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
	else {
		if (settings.isDesktop) return <BoxDesktopPlayer fullscreen={fullscreen} time={time ? time : song} />
		return <BoxPlayer fullscreen={fullscreen} />
	}
}

export default Player;