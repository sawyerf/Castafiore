import React from 'react';
import { Animated, PanResponder } from 'react-native';

import { ConfigContext } from '~/contexts/config';
import { SongContext, SongDispatchContext } from '~/contexts/song';
import Player from '~/utils/player';

const SlideControl = ({ children, style, }) => {
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
			position.setValue(0)
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
				Player.nextSong(config, song, songDispatch)
			} else if (position._value > 50) {
				Player.previousSong(config, song, songDispatch)
			} else if (position._value === 0) {
				let now = Date.now()
				if (now - previousTap.current < 300) {
					if (song.state === Player.State.Playing) Player.pauseSong()
					else Player.resumeSong()
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
			style={[style, {
				touchAction: 'none', // this fix bug on iOS PWA
				transform: [{ translateX: position }]
			}]}
			{...panResponder.panHandlers}
		>
			{children}
		</Animated.View>
	)
}

export default SlideControl;