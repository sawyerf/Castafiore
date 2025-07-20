import React from 'react'
import { View, Text, PanResponder, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import size from '~/styles/size'

const SideBarLetter = ({ alpha, onPress }) => {
  const viewRef = React.useRef(null)
  const layoutBar = React.useRef({ height: 0, y: 0 })
  const insets = useSafeAreaInsets()

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const y = gestureState.moveY
      const index = (y - layoutBar.current.y) / layoutBar.current.height * alpha.length
      if (index < 0 || index >= alpha.length) return
      const letter = alpha[Math.floor(index)]
      if (onPress) onPress(letter)
    },
    onPanResponderGrant: (evt, gestureState) => {
      const y = gestureState.y0
      const index = (y - layoutBar.current.y) / layoutBar.current.height * alpha.length
      if (index < 0 || index >= alpha.length) return
      const letter = alpha[Math.floor(index)]
      if (onPress) onPress(letter)
    },
  })

  React.useEffect(() => {
    const sub = Dimensions.addEventListener('change', upLayoutBar)
    return () => sub.remove()
  }, [])

  const upLayoutBar = React.useCallback(() => {
    if (!viewRef.current) return
    viewRef.current.measure((x, y, width, height, pageX, pageY) => {
      layoutBar.current = { height, y: pageY }
    })
  }, [])

  return (
    <View
      style={{
        zIndex: 1000,
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        paddingEnd: 2 + insets.right,
      }}
    >
      <View
        ref={viewRef}
        onLayout={upLayoutBar}
        {...panResponder.panHandlers}
        style={{
          borderRadius: size.radius.circle,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: 5,
        }}
      >
        {
          alpha.map((letter, index) => (
            <Text
              key={index}
              style={{
                fontSize: 10,
                color: 'white',
                textAlign: 'center',
              }}
            >
              {letter}
            </Text>
          ))
        }
      </View>
    </View>
  )
}

export default SideBarLetter