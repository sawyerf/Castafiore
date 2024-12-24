import React from 'react'
import { View, Pressable, Platform } from 'react-native'

import { ThemeContext } from '~/contexts/theme'

const SlideBar = ({
  progress = 0,
  onPress = (progress) => { },
  stylePress = {},
  styleBar = {},
  styleProgress = {},
  isBitogno = false,
  sizeBitogno = 12,
}) => {
  const [layoutBar, setLayoutBar] = React.useState({ width: 0, height: 0 })
  const theme = React.useContext(ThemeContext)

  const onPressHandler = ({ nativeEvent }) => {
    const prog = nativeEvent.locationX / layoutBar.width
    if (!prog || prog < 0) return onPress(0)
    else if (prog > 1) return onPress(1)
    return onPress(prog)
  }

  return (
    <Pressable
      style={stylePress}
      onPressIn={onPressHandler}
      onPressOut={onPressHandler}
      onLayout={({ nativeEvent }) => setLayoutBar({ width: nativeEvent.layout.width, height: nativeEvent.layout.height })}
      pressRetentionOffset={{ top: 20, left: 0, right: 0, bottom: 20 }}
    >
      <View style={{ borderRadius: 3, backgroundColor: theme.primaryLight, overflow: 'hidden', ...styleBar }}>
        <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: theme.primaryTouch, ...styleProgress }} />
      </View>
      {isBitogno && <View style={styles.bitognoBar(progress, sizeBitogno, theme)} />}
    </Pressable>
  )
}

const styles = {
  bitognoBar: (vol, sizeBitogno, theme) => ({
    position: 'absolute',
    width: sizeBitogno,
    height: sizeBitogno,
    borderRadius: sizeBitogno / 2,
    backgroundColor: theme.primaryTouch,
    left: Platform.OS === 'web' ? `calc(${vol * 100}% - ${sizeBitogno / 2}px)` : vol * 99 + '%', // TODO: fix calc native
    top: 7
  })
}

export default SlideBar;