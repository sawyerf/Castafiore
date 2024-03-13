import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ThemeContext } from '~/contexts/theme';

const IconButton = ({ icon, size = 23, color = undefined, style={}, onPress, onLongPress=null, delayLongPress = 200 }) => {
  const theme = React.useContext(ThemeContext)
	return (
		<TouchableOpacity
			style={{
				justifyContent: 'center',
				...style,
			}}
			onLongPress={onLongPress}
			delayLongPress={delayLongPress}
			onPress={onPress}>
			<Icon name={icon} size={size} color={color ? color : theme.primaryTouch} />
		</TouchableOpacity>
	)
}

export default IconButton;