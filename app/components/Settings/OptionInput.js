import React from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import theme from '~/utils/theme';
import settingStyles from '~/styles/settings';

const OptionInput = ({ title, placeholder, value, onChangeText, isPassword, inputMode = undefined, isLast = false }) => {
	return (
		<View style={settingStyles.optionItem(isLast)} >
			<Text
				numberOfLines={1}
				style={{ color: theme.primaryLight, fontSize: 16, marginRight: 10, fontWeight: '400' }}>{title}</Text>
			<TextInput
				style={{
					flex: 1,
					textAlign: 'right',
					color: theme.primaryLight,
					fontSize: 16,
					height: '100%',
					...Platform.select({
						web: { outline: 'none' }
					}),
					overflow: 'hidden',
				}}
				numberOfLines={1}
				multiline={false}
				placeholder={placeholder}
				placeholderTextColor={theme.secondaryLight}
				autoFocus={false}
				autoCorrect={false}
				value={value}
				inputMode={inputMode}
				secureTextEntry={isPassword}
				onChangeText={value => onChangeText(value)}
			/>
		</View>
	)
}

export default OptionInput;