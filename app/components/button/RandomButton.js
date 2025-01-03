import React from 'react';
import { SongContext } from '~/contexts/song';
import { ThemeContext } from '~/contexts/theme';
import presStyles from '~/styles/pres';
import { playSong } from '~/utils/player';

import { ConfigContext } from '~/contexts/config';
import IconButton from './IconButton';

const RandomButton = ({ songList, size = 23 }) => {
  const theme = React.useContext(ThemeContext)
	const [song, songDispatch] = React.useContext(SongContext)
	const config = React.useContext(ConfigContext)

	function shuffle(array) {
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
			color={theme.primaryLight}
		/>
	);
}

export default RandomButton;