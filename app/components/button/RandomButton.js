import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import theme from '~/utils/theme';
import presStyles from '~/styles/pres';
import { SoundContext, playSong } from '~/utils/playSong';
import { ConfigContext } from '~/utils/config';

const RandomButton = ({ songList }) => {
	const sound = React.useContext(SoundContext)
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
			playSong(config, sound, songList, 0)
		}
	}

	return (
		<TouchableOpacity style={presStyles.button} onPress={shuffleSong}>
			<Icon name="random" size={23} color={theme.primaryLight} />
		</TouchableOpacity>
	);
}

export default RandomButton;