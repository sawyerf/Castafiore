import React from 'react'
import { useWindowDimensions } from 'react-native'

import { SettingsContext } from '~/contexts/settings'
import { SongContext } from '~/contexts/song'
import BoxDesktopPlayer from '~/components/player/BoxDesktopPlayer'
import BoxPlayer from '~/components/player/BoxPlayer'
import FullScreenHorizontalPlayer from '~/components/player/FullScreenHorizontalPlayer'
import FullScreenPlayer from '~/components/player/FullScreenPlayer'

const Player = ({ state }) => {
	const song = React.useContext(SongContext)
	const settings = React.useContext(SettingsContext)
	const { height, width } = useWindowDimensions()
	const [fullScreen, setFullScreen] = React.useState(false)

	React.useEffect(() => {
		setFullScreen(false)
	}, [state.index])

	if (!song?.songInfo) return null
	else if (fullScreen) {
		if (width <= height) return <FullScreenPlayer setFullScreen={setFullScreen} />
		else return <FullScreenHorizontalPlayer setFullScreen={setFullScreen} />
	}
	else if (settings.isDesktop) return <BoxDesktopPlayer setFullScreen={setFullScreen} />
	return <BoxPlayer setFullScreen={setFullScreen} />
}

export default Player