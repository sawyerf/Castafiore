import React from 'react'
import { Animated, Platform } from 'react-native'

import IconButton from '~/components/button/IconButton'

const RotateIconButton = ({ onPress, ...props }) => {
	const rotationValue = React.useRef(new Animated.Value(0)).current
	const rotation = rotationValue.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '360deg']
	})

  const rotate = () => {
		rotationValue.setValue(0)
		Animated.timing(rotationValue, {
			toValue: 1,
			duration: 1000,
			useNativeDriver: Platform.OS !== 'web',
		}).start()
  }

  return (
    <Animated.View style={{ transform: [{ rotate: rotation }] }}>
      <IconButton
        {...props}
        onPress={() => onPress(rotate)}
      />
    </Animated.View>
  )
}

export default RotateIconButton