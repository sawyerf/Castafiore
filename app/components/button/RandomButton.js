import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SongContext } from '~/contexts/song';
import theme from '~/utils/theme';
import presStyles from '~/styles/pres';
import { playSong } from '~/utils/player';

import { ConfigContext } from '~/contexts/config';

const RandomButton = ({ songList, size = 23 }) => {
	const [song, songDispatch] = React.useContext(SongContext)
	const config = React.useContext(ConfigContext)

	function shuffle(array) {
		return array.map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
	}

	const shuffleSong = () => {
		if (songList?.length) {
			playSong(config, song, songDispatch, shuffle(songList), 0)
		}
	}

	return (
		<TouchableOpacity style={presStyles.button} onPress={shuffleSong}>
			<Icon name="random" size={size} color={theme.primaryLight} />
		</TouchableOpacity>
	);
}

export default RandomButton;