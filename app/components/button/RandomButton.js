import React from 'react'

import { ConfigContext } from '~/contexts/config'
import { playSong } from '~/utils/player'
import { SongDispatchContext } from '~/contexts/song'
import { ThemeContext } from '~/contexts/theme'
import IconButton from '~/components/button/IconButton'
import presStyles from '~/styles/pres'

const RandomButton = ({ songList, size = 23 }) => {
	const theme = React.useContext(ThemeContext)
	const songDispatch = React.useContext(SongDispatchContext)
	const config = React.useContext(ConfigContext)

	const shuffle = (array) => {
		return array.map(value => ({ value, sort: Math.random() }))
			.sort((a, b) => a.sort - b.sort)
			.map(({ value }) => value)
	}

	const shuffleSong = () => {
		if (songList?.length) {
			playSong(config, songDispatch, shuffle(songList), 0)
		}
	}

	return (
		<IconButton
			style={presStyles.button}
			onPress={shuffleSong}
			icon="random"
			size={size}
			color={theme.primaryText}
		/>
	)
}

export default RandomButton