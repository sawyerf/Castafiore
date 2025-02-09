import React from 'react';
import { Text, View, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ThemeContext } from '~/contexts/theme';
import settingStyles from '~/styles/settings';

const ButtonSwitch = ({ title, value, onPress, icon = null, isLast = false }) => {
	const theme = React.useContext(ThemeContext)

	return (
		<Pressable
			style={settingStyles.optionItem(theme, isLast)}
			color={theme.primaryLight}
			onPress={onPress}
		>
			{icon && <View
				style={{
					height: '60%',
					aspectRatio: 1,
					marginRight: 15,
					backgroundColor: theme.primaryTouch,
					borderRadius: 5,
					alignItems: 'center',
					justifyContent: 'center',
				}}>
				<Icon
					name={icon}
					size={18}
					color={theme.innerTouch}
				/></View>}
			<Text
				numberOfLines={1}
				style={settingStyles.primaryText(theme)}>{title}</Text>
			<View
				style={{
					height: 30,
					width: 50,
					backgroundColor: value ? theme.primaryTouch : theme.secondaryLight,
					borderRadius: 15,
					justifyContent: 'center',
				}}
			>
				<View
					style={{
						height: 24,
						width: 24,
						backgroundColor: theme.innerTouch,
						borderRadius: 12,
						position: 'absolute',
						...(value ? { right: 3 } : { left: 3 }),
					}}
				/>
			</View>
		</Pressable>
	)
}

export default ButtonSwitch;