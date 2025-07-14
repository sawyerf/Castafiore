import React from 'react'
import { View, Platform, PanResponder, StyleSheet, Dimensions } from 'react-native'

import { ThemeContext } from '~/contexts/theme'

const SlideBar = ({
	progress = 0,
	onStart = () => { },
	onChange = () => { },
	onComplete = () => { },
	stylePress = {},
	styleBar = {},
	styleProgress = {},
	isBitogno = false,
	sizeBitogno = 12,
	disable = false
}) => {
	const theme = React.useContext(ThemeContext)
	const layoutBar = React.useRef({ width: 0, height: 0, x: 0 })
	const viewRef = React.useRef(null)
	const prog = React.useRef(0)
	const [widthBar, setWidth] = React.useState(0)
	const panResponder = PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onMoveShouldSetPanResponder: () => true,
		onPanResponderGrant: (_, gestureState) => {
			if (disable) return
			prog.current = (gestureState.x0 - layoutBar.current.x) / layoutBar.current.width
			if (!prog.current || prog.current < 0) return onStart(0)
			else if (prog.current > 1) return onStart(1)
			onStart(prog.current)
		},
		onPanResponderMove: (_, gestureState) => {
			if (disable) return
			prog.current = (gestureState.moveX - layoutBar.current.x) / layoutBar.current.width
			if (!prog.current || prog.current < 0) return onChange(0)
			else if (prog.current > 1) return onChange(1)
			onChange(prog.current)
		},
		onPanResponderRelease: () => {
			if (disable) return
			if (!prog.current || prog.current < 0) return onComplete(0)
			else if (prog.current > 1) return onComplete(1)
			onComplete(prog.current)
		}
	})

	const upLayoutBar = React.useCallback(() => {
		if (!viewRef.current) return
		viewRef.current.measure((x, y, width, height, pageX) => {
			setWidth(width)
			layoutBar.current = { width, x: pageX }
		})
	}, [])

	React.useEffect(() => {
		const sub = Dimensions.addEventListener('change', upLayoutBar)
		return () => sub.remove()
	}, [])

	return (
		<View
			style={[stylePress, { touchAction: 'none' }]}
			ref={viewRef}
			onLayout={upLayoutBar}
			pressRetentionOffset={{ top: 20, left: 0, right: 0, bottom: 20 }}
			{...panResponder.panHandlers}
		>
			<View style={[{ borderRadius: 3, backgroundColor: theme.backgroundTouch, overflow: 'hidden' }, styleBar]}>
				<View
					style={[{ width: `${progress * 100}%`, height: '100%', backgroundColor: theme.primaryTouch }, styleProgress]}
				/>
			</View>
			{isBitogno && <View style={styles.bitognoBar(progress, sizeBitogno, theme, widthBar)} />}
		</View>
	)
}

const calcPositionBitogno = (vol, sizeBitogno, width) => {
	const result = ((vol * width) - (sizeBitogno / 2))
	if (!result) return 0
	if (result < 0) return 0
	if (result > width) return width - sizeBitogno / 2
	return result
}

const styles = StyleSheet.create({
	bitognoBar: (vol, sizeBitogno, theme, width) => ({
		position: 'absolute',
		width: sizeBitogno,
		height: sizeBitogno,
		borderRadius: sizeBitogno / 2,
		backgroundColor: theme.primaryTouch,
		left: Platform.select({ web: `calc(${vol * 100}% - ${sizeBitogno / 2}px)`, default: calcPositionBitogno(vol, sizeBitogno, width) }),
		top: 7
	})
})

export default SlideBar;