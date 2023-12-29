import React from 'react';
import { Platform } from 'react-native';

import { SoundContext, nextSong, previousSong, pauseSong, resumeSong } from '~/utils/player';
import { ConfigContext } from '~/utils/config';
import { getApi } from '~/utils/api';
import BoxPlayer from './BoxPlayer';
import FullScreenPlayer from './FullScreenPlayer';

const PlayerBox = ({ navigation, state, fullscreen }) => {
	const sound = React.useContext(SoundContext)
	const config = React.useContext(ConfigContext)
	const [isPlaying, setIsPlaying] = React.useState(false)
	const [timer, setTimer] = React.useState({
		current: 0,
		total: 0,
	})

	React.useEffect(() => {
		if (config?.query) {
			sound.setOnPlaybackStatusUpdate((playbackStatus) => {
				setIsPlaying(playbackStatus.isPlaying)
				if (playbackStatus.isLoaded) {
					setTimer({
						current: playbackStatus.positionMillis / 1000,
						total: playbackStatus.durationMillis / 1000,
					})
				}
				if (playbackStatus.didJustFinish) {
					const id = sound.songInfo.id
					setTimeout(nextSong(config, sound), 500)
					getApi(config, 'scrobble', `id=${id}&submission=true`)
						.catch((error) => { })
				}
			})
			if (Platform.OS === 'web') {
				navigator.mediaSession.setActionHandler("pause", () => {
					pauseSong(sound)
				});
				navigator.mediaSession.setActionHandler("play", () => {
					resumeSong(sound)
				});
				navigator.mediaSession.setActionHandler("previoustrack", () => {
					previousSong(config, sound)
				});
				navigator.mediaSession.setActionHandler("nexttrack", () => {
					nextSong(config, sound)
				});
				navigator.mediaSession.setActionHandler("seekbackward", () => {
					previousSong(config, sound)
				});
				navigator.mediaSession.setActionHandler("seekforward", () => {
					nextSong(config, sound)
				});
			}
		}
	}, [sound, config])

	React.useEffect(() => {
		fullscreen.set(false)
	}, [state.index])

	if (!sound?.songInfo) return null
	if (fullscreen.value) return <FullScreenPlayer fullscreen={fullscreen} isPlaying={isPlaying} timer={timer} />
	else return <BoxPlayer isPlaying={isPlaying} fullscreen={fullscreen} />
}

export default PlayerBox;