import React from 'react';
import { Text, View, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ThemeContext } from '~/contexts/theme';
import settingStyles from '~/styles/settings';
import size from '~/styles/size';
import mainStyles from '~/styles/main';

const ButtonMenu = ({ title, endText, onPress, icon, isLast = false }) => {
	const theme = React.useContext(ThemeContext)

	return (
		<Pressable
			style={({ pressed }) => ([mainStyles.opacity({ pressed }), settingStyles.optionItem(theme, isLast)])}
			onPress={onPress}
		>
			<View
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
				/></View>
			<Text
				numberOfLines={1}
				style={settingStyles.primaryText(theme)}>{title}</Text>
			<Text
				numberOfLines={1}
				style={{
					flex: 1,
					textAlign: 'right',
					color: theme.secondaryLight,
					fontSize: size.text.medium,
					overflow: 'hidden',
				}}>
				{endText}
			</Text>
			<Icon
				name="angle-right"
				size={size.icon.tiny}
				style={{ marginStart: 10 }}
				color={theme.secondaryLight}
			/>
		</Pressable>
	)
}

export default ButtonMenu;