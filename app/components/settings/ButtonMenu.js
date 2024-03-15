import React from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ThemeContext } from '~/contexts/theme';

const ButtonMenu = ({ title, endText, onPress, icon, isLast = false }) => {
  const theme = React.useContext(ThemeContext)

	return (
		<TouchableOpacity
			style={{
				width: '100%',
				height: 50,
				paddingEnd: 5,
				alignItems: 'center',
				borderBottomColor: theme.secondaryLight,
				borderBottomWidth: isLast ? 0 : .5,
				flexDirection: 'row',
			}}
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
				style={{ color: theme.primaryLight, fontSize: 16, marginEnd: 10, flex: 1 }}>{title}</Text>
			<Text
				numberOfLines={1}
				style={{
					flex: 1,
					textAlign: 'right',
					color: theme.secondaryLight,
					fontSize: 16,
					overflow: 'hidden',
				}}>
				{endText}
			</Text>
			<Icon
				name="angle-right"
				size={20}
				style={{ marginStart: 10 }}
				color={theme.secondaryLight}
			/>
		</TouchableOpacity>
	)
}

export default ButtonMenu;