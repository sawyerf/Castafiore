import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import IconButton from '~/components/button/IconButton';
import { ThemeContext } from '~/contexts/theme';
import { SettingsContext } from '~/contexts/settings';

const CustomScroll = ({ children, style = { width: '100%' }, contentContainerStyle = { paddingHorizontal: 20, columnGap: 10 } }) => {
  const refScroll = React.useRef(null)
  const refPosition = React.useRef(0)
  const theme = React.useContext(ThemeContext)
  const settings = React.useContext(SettingsContext)

  const goRight = () => {
    // (160 + 10) * 3 = 510
    refScroll.current.scrollTo({ x: refPosition.current + 510, animated: false })
  }

  const goLeft = () => {
    refScroll.current.scrollTo({ x: refPosition.current - 510, animated: false })
  }

  return (
    <View>
      {settings?.scrollHelper && <View
        style={{
          position: 'absolute',
          zIndex: 1,
          flexDirection: 'row',
          right: 10,
          top: -40,
          columnGap: 1,
        }}
      >
        <IconButton icon="chevron-left" size={20} onPress={goLeft} color={theme.secondaryLight}
          style={{
            backgroundColor: theme.secondaryDark,
            height: 30,
            width: 30,
            borderTopLeftRadius: 5,
            borderBottomLeftRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
          }} />
        <IconButton icon="chevron-right" size={20} onPress={goRight} color={theme.secondaryLight}
          style={{
            backgroundColor: theme.secondaryDark,
            height: 30,
            width: 30,
            borderTopRightRadius: 5,
            borderBottomRightRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
          }} />
      </View>}
      <ScrollView
        ref={refScroll}
        onScroll={(event) => { refPosition.current = event.nativeEvent.contentOffset.x }}
        horizontal={true}
        style={style}
        contentContainerStyle={contentContainerStyle}
        showsHorizontalScrollIndicator={false}
      >
        {children}
      </ScrollView >
    </View>
  )
}

export default CustomScroll;