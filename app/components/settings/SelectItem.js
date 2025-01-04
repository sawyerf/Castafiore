import React from 'react'
import { Pressable, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { ThemeContext } from '~/contexts/theme'
import settingStyles from '~/styles/settings'

const SelectItem = ({ text, onPress, icon, colorIcon = null, isSelect = false }) => {
  const theme = React.useContext(ThemeContext)

  return (
    <Pressable
      style={({ pressed }) => ({
        ...settingStyles.optionItem(theme, true),
        opacity: pressed ? 0.5 : 1
      })}
      onPress={onPress}>
      <Icon name={icon} size={20} color={colorIcon || theme.primaryLight} style={{ marginEnd: 10 }} />
      <Text
        numberOfLines={1}
        style={{ color: theme.primaryLight, fontSize: 16, marginRight: 10, textTransform: 'uppercase', flex: 1, overflow: 'hidden' }}
      >
        {text}
      </Text>
      {isSelect && <Icon name="check" size={20} color={theme.primaryTouch} />}
    </Pressable>
  )
}

export default SelectItem