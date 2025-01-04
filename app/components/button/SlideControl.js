import React from 'react';
import { Animated, PanResponder, Image, Dimensions } from 'react-native';

import { ConfigContext } from '~/contexts/config';
import { SongContext, SongDispatchContext } from '~/contexts/song';
import { nextSong, previousSong, resumeSong, pauseSong } from '~/utils/player';
import { ThemeContext } from '~/contexts/theme';
import ImageError from '~/components/ImageError';

const SlideControl = ({ uri }) => {
	const theme = React.useContext(ThemeContext)
	const song = React.useContext(SongContext)
	const songDispatch = React.useContext(SongDispatchContext)
	const config = React.useContext(ConfigContext)
	const startMove = React.useRef(0)
	const position = React.useRef(new Animated.Value(0)).current
	const previousTap = React.useRef(0)
	const panResponder = PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onMoveShouldSetPanResponder: () => true,
		onPanResponderGrant: (_, gestureState) => {
			startMove.current = gestureState.x0
		},
		onPanResponderMove: (_, gestureState) => {
			const move = gestureState.moveX - startMove.current
			if (move < -100) position.setValue(-100)
			else if (move > 100) position.setValue(100)
			else position.setValue(move)
		},
		onPanResponderRelease: () => {
			startMove.current = 0
			if (position._value < -50) {
				nextSong(config, song, songDispatch)
			} else if (position._value > 50) {
				previousSong(config, song, songDispatch)
			} else if (position._value === 0) {
				let now = Date.now()
				if (now - previousTap.current < 300) {
					if (song.isPlaying) pauseSong()
					else resumeSong()
					now = 0
				}
				previousTap.current = now
			}
			Animated.timing(position, {
				toValue: 0,
				useNativeDriver: true,
				duration: 200
			}).start()
		}
	})

	return (
		<Animated.View
			style={{
				...styles.albumImage(),
				transform: [{ translateX: position }]
			}}
			{...panResponder.panHandlers}
		>
			<ImageError
				source={{ uri }}
				style={{
					...styles.albumImage(),
					backgroundColor: theme.secondaryDark,
				}}
			/>
		</Animated.View>
	)
}

const styles = {
	albumImage: () => {
		// it shitcode but it dosn't work with just width and aspectRatio for the songlist (queue)
		let width = Dimensions.get('window').width
		if (width > 500) width = 500
		return {
			maxWidth: width - 50,
			width: width - 50,
			maxHeight: width - 50,
			height: width - 50,
			aspectRatio: 1,
			borderRadius: 10,
		}
	},
}


export default SlideControl;