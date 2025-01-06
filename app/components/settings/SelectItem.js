import React from 'react'
import { Pressable, Text } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { ThemeContext } from '~/contexts/theme'
import mainStyles from '~/styles/main';
import settingStyles from '~/styles/settings'
import size from '~/styles/size';

const SelectItem = ({ text, onPress, icon, colorIcon = null, isSelect = false }) => {
	const theme = React.useContext(ThemeContext)

	return (
		<Pressable
			style={({ pressed }) => ([mainStyles.opacity({ pressed }), settingStyles.optionItem(theme, true)])}
			onPress={onPress}>
			<Icon name={icon} size={size.icon.tiny} color={colorIcon || theme.primaryLight} style={{ marginEnd: 10 }} />
			<Text
				numberOfLines={1}
				style={{ color: theme.primaryLight, fontSize: size.text.medium, marginRight: 10, textTransform: 'uppercase', flex: 1, overflow: 'hidden' }}
			>
				{text}
			</Text>
			{isSelect && <Icon name="check" size={size.icon.tiny} color={theme.primaryTouch} />}
		</Pressable>
	)
}

export default SelectItem