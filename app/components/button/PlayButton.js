import React from 'react';
import { ActivityIndicator } from 'react-native';

import { SongContext } from '~/contexts/song';
import Player from '~/utils/player';
import IconButton from './IconButton';

const PlayButton = ({ style = {}, size, color }) => {
	const song = React.useContext(SongContext)
	const [icon, setIcon] = React.useState('pause')

	React.useEffect(() => {
		switch (song.state) {
			case Player.State.Playing:
				setIcon('pause')
				break
			case Player.State.Paused:
				setIcon('play')
				break
			case Player.State.Stopped:
				setIcon('play')
				break
			case Player.State.Error:
				setIcon('warning')
				break
			case Player.State.Loading:
				setIcon('square')
				break
			default:
				break
		}
	}, [song.state])

	const onPress = () => {
		if (song.state === Player.State.Error) {
			Player.reload()
		} if (song.isPlaying) {
			Player.pauseSong()
		} else {
			Player.resumeSong()
		}
	}

	if (icon === 'square') {
		return <ActivityIndicator size={'small'} color={color} style={style} />
	}
	return (
		<IconButton
			style={[style]}
			onPress={onPress}
			size={size}
			icon={icon}
			color={color}
		/>
	)
}

export default PlayButton;