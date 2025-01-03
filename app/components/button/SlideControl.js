import React from 'react';
import { Animated, PanResponder, Image, Dimensions } from 'react-native';

import { ConfigContext } from '~/contexts/config';
import { SongContext } from '~/contexts/song';
import { nextSong, previousSong } from '~/utils/player';

const SlideControl = ({ uri }) => {
	const [song, songDispatch] = React.useContext(SongContext)
	const config = React.useContext(ConfigContext)
	const startMove = React.useRef(0)
	const position = React.useRef(new Animated.Value(0)).current
	const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false,
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
				borderRadius: undefined,
				transform: [{ translateX: position }]
			}}
			{...panResponder.panHandlers}
		>
			<Image
				source={{ uri }}
				style={styles.albumImage()}
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