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
		let currentIndex = array.length, randomIndex;

		// While there remain elements to shuffle.
		while (currentIndex > 0) {

			// Pick a remaining element.
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			// And swap it with the current element.
			[array[currentIndex], array[randomIndex]] = [
				array[randomIndex], array[currentIndex]];
		}

		return array;
	}

	const shuffleSong = () => {
		if (songList?.length) {
			shuffle(songList)
			playSong(config, song, songDispatch, songList, 0)
		}
	}

	return (
		<TouchableOpacity style={presStyles.button} onPress={shuffleSong}>
			<Icon name="random" size={size} color={theme.primaryLight} />
		</TouchableOpacity>
	);
}

export default RandomButton;