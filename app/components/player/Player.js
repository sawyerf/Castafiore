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

	React.useEffect(() => {
		if (config?.query && song?.sound) {
			handleAction(config, song, songDispatch)
		}
	}, [song.sound, config])

	const endedHandler = () => {
		nextSong(config, song, songDispatch)
		getApi(config, 'scrobble', `id=${song.songInfo.id}&submission=true`)
			.catch((error) => { })
	}

	React.useEffect(() => {
		if (Platform.OS == 'web' && song.sound) {
			handleAction(config, song, songDispatch)
			song.sound.addEventListener('ended', endedHandler)
			return () => {
				song.sound.removeEventListener('ended', endedHandler)
			}
		}
	}, [song.songInfo, song.index, song.queue])

	React.useEffect(() => {
		fullscreen.set(false)
	}, [state.index])

	if (!song?.songInfo) return null
	if (fullscreen.value) return <FullScreenPlayer fullscreen={fullscreen} />
	else return <BoxPlayer fullscreen={fullscreen} />
}

export default Player;