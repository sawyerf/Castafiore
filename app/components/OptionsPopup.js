import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import theme from '~/utils/theme';

const OptionsPopup = ({ visible, options }) => {
	if (!visible) return null;
	return (
		<View style={{
			width: "100%",
			marginBottom: 10,
			backgroundColor: theme.primaryDark,
			zIndex: 1,
		}}>
			{options.map((option, index) => (
				<TouchableOpacity
					style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 15 }}
					key={index}
					onPress={option.onPress}>
					<Icon name={option.icon} size={20} color={theme.primaryLight} />
					<Text style={{ color: theme.primaryLight, fontSize: 20, marginStart: 10 }}>{option.name}</Text>
				</TouchableOpacity>
			))}
		</View>
	)
}

export default OptionsPopup;