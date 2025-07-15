import React, { useRef, useEffect, useState } from 'react'
import { ScrollView, Animated } from 'react-native'

const Marquee = ({ text, style = {}, styleContainer = {} }) => {
  const animatedValue = useRef(new Animated.Value(0)).current
  const [textWidth, setTextWidth] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const duration = useRef(0)

  const calcDuration = () => {
    if (textWidth <= containerWidth) {
      return 0;
    }
    duration.current = ((textWidth - containerWidth) / 15) * 1000 // 15 pixels per second as a speed
    return duration
  }

  const startScrolling = () => {
    animatedValue.setValue(0)

    Animated.loop(
      Animated.sequence([
        Animated.delay(2000),
        Animated.timing(animatedValue, {
          toValue: -(textWidth - containerWidth),
          duration: duration.current,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: duration.current,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }

  useEffect(() => {
    if (!containerWidth || !textWidth || textWidth <= containerWidth) {
      animatedValue.stopAnimation()
      animatedValue.setValue(0)
      return
    }
    calcDuration()
    startScrolling()
  }, [textWidth, containerWidth])

  return (
    <ScrollView
      onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
      style={styleContainer}
      showsHorizontalScrollIndicator={false}
      horizontal={true}
      scrollEnabled={false}
    >
      <Animated.Text
        onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
        style={[
          style,
          {
            transform: [{ translateX: animatedValue }],
          },
        ]}
      >
        {text}
      </Animated.Text>
    </ScrollView>
  )
}

export default Marquee