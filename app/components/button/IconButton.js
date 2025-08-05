import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ThemeContext } from '~/contexts/theme';
import mainStyles from '~/styles/main';

const IconButton = ({ icon, size = 23, color = undefined, style = {}, styleIcon = {}, pressEffect = true, onPress, onLongPress = null, delayLongPress = 200 }) => {
	const theme = React.useContext(ThemeContext)
	return (
		<Pressable
			style={({ pressed }) => ([mainStyles.opacity({ pressed, enable: pressEffect }), { justifyContent: 'center' }, StyleSheet.flatten(style)])}
			onLongPress={onLongPress}
			delayLongPress={delayLongPress}
			onPress={onPress}
			onContextMenu={(ev) => {
				ev.preventDefault()
				if (onLongPress) onLongPress()
			}}
		>
			<Icon name={icon} size={size} color={color ? color : theme.primaryTouch} style={styleIcon} />
		</Pressable>
	)
}

export default IconButton;