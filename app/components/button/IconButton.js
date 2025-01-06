import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ThemeContext } from '~/contexts/theme';
import mainStyles from '~/styles/main';

const IconButton = ({ icon, size = 23, color = undefined, style = {}, onPress, onLongPress = null, delayLongPress = 200 }) => {
	const theme = React.useContext(ThemeContext)
	return (
		<Pressable
			style={({ pressed }) => ([mainStyles.opacity({ pressed }), { justifyContent: 'center' }, StyleSheet.flatten(style) ])}
			onLongPress={onLongPress}
			delayLongPress={delayLongPress}
			onPress={onPress}>
			<Icon name={icon} size={size} color={color ? color : theme.primaryTouch} />
		</Pressable>
	)
}

export default IconButton;