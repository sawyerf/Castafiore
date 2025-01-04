import React from 'react'
import { Text, View } from 'react-native'

import { ThemeContext } from '~/contexts/theme'
import settingStyles from '~/styles/settings'

const TableItem = ({ title, value, isLast = false }) => {
  const theme = React.useContext(ThemeContext)

  return (
    <View style={{
      ...settingStyles.optionItem(theme, isLast),
      justifyContent: 'space-between'
    }} >
      <Text
        numberOfLines={1}
        style={{ ...settingStyles.primaryText(theme), flex: undefined, maxWidth: '80%' }}
      >{title}</Text>
      <Text
        numberOfLines={1}
        style={{ color: theme.primaryLight, fontSize: 16, textAlign: 'right' }}
      >{value}</Text>
    </View>
  )
}

export default TableItem
