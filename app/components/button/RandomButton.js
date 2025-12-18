import React from 'react'

import { useConfig } from '~/contexts/config'
import { playSong } from '~/utils/player'
import { useSongDispatch } from '~/contexts/song'
import { useTheme } from '~/contexts/theme'
import IconButton from '~/components/button/IconButton'
import presStyles from '~/styles/pres'

const RandomButton = ({ songList, size = 23 }) => {
	const theme = useTheme()
	const songDispatch = useSongDispatch()
	const config = useConfig()

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