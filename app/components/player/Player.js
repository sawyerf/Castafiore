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
	const [isPlaying, setIsPlaying] = React.useState(false)
	const [timer, setTimer] = React.useState({
		current: 0,
		total: 0,
	})

	React.useEffect(() => {
		if (config?.query && song?.sound) {
			song.sound.setOnPlaybackStatusUpdate((playbackStatus) => {
				setIsPlaying(playbackStatus.isPlaying)
				if (playbackStatus.isLoaded) {
					setTimer({
						current: playbackStatus.positionMillis / 1000,
						total: playbackStatus.durationMillis / 1000,
					})
				}
				if (playbackStatus.didJustFinish) {
					const id = song.songInfo.id
					nextSong(config, song, songDispatch)
					getApi(config, 'scrobble', `id=${id}&submission=true`)
						.catch((error) => { })
				}
			})
			handleAction(config, song, songDispatch)
		}
	}, [song.sound, config])

	React.useEffect(() => {
		fullscreen.set(false)
	}, [state.index])

	if (!song?.songInfo) return null
	if (fullscreen.value) return <FullScreenPlayer fullscreen={fullscreen} isPlaying={isPlaying} timer={timer} />
	else return <BoxPlayer isPlaying={isPlaying} fullscreen={fullscreen} />
}

export default Player;