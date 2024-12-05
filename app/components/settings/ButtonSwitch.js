import React from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ThemeContext } from '~/contexts/theme';

const ButtonSwitch = ({ title, value, onPress, icon = null, isLast = false }) => {
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
			activeOpacity={1}
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
				/></View> }
			<Text
				numberOfLines={1}
				style={{ color: theme.primaryLight, fontSize: 16, marginEnd: 10, flex: 1 }}>{title}</Text>
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
						backgroundColor: theme.primaryLight,
						borderRadius: 12,
						position: 'absolute',
						...(value ? { right: 3 } : { left: 3 }),
					}}
				/>
			</View>
		</TouchableOpacity>
	)
}

export default ButtonSwitch;