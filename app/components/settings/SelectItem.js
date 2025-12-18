import React from 'react'
import { Pressable, Text } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { ThemeContext } from '~/contexts/theme'
import mainStyles from '~/styles/main'
import settingStyles from '~/styles/settings'
import size from '~/styles/size'

const SelectItem = ({ text, onPress, icon = null, emoji = null, colorIcon = null, isSelect = false, disabled = false }) => {
	const theme = React.useContext(ThemeContext)

	return (
		<Pressable
			disabled={disabled}
			style={({ pressed }) => ([mainStyles.opacity({ pressed }), settingStyles.optionItem(theme, true)])}
			onPress={onPress}>
			{
				icon &&
				<Icon name={icon} size={size.icon.tiny} color={colorIcon || theme.primaryText} style={{ marginEnd: 10, opacity: disabled ? 0.5 : 1 }} />
			}
			{
				emoji &&
				<Text style={{ fontSize: size.text.medium, marginEnd: 10, opacity: disabled ? 0.5 : 1 }}>
					{emoji}
				</Text>
			}
			<Text
				numberOfLines={1}
				style={{
					color: theme.primaryText,
					fontSize: size.text.medium,
					marginRight: 10,
					textTransform: 'uppercase',
					flex: 1,
					overflow: 'hidden',
					opacity: disabled ? 0.5 : 1,
				}}
			>
				{text}
			</Text>
			{isSelect && <Icon name="check" size={size.icon.tiny} color={theme.primaryTouch} />}
		</Pressable>
	)
}

export default SelectItem