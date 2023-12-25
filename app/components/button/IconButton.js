import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import theme from '~/utils/theme';

const IconButton = ({ icon, size = 23, color = theme.primaryTouch, style={}, onPress }) => {
	return (
		<TouchableOpacity
			style={{
				justifyContent: 'center',
				...style,
			}}
			onPress={onPress}>
			<Icon name={icon} size={size} color={color} />
		</TouchableOpacity>
	)
}

export default IconButton;