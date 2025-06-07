import React from 'react';
import { Text, View, TextInput, Platform } from 'react-native';

import { ThemeContext } from '~/contexts/theme';
import settingStyles from '~/styles/settings';
import size from '~/styles/size';

const OptionInput = ({ title, placeholder, value, onChangeText, isPassword, autoComplete = 'off', inputMode = undefined, isLast = false, secureTextEntry = undefined }) => {
	const theme = React.useContext(ThemeContext)

	return (
		<View style={settingStyles.optionItem(theme, isLast)}>
			<Text
				numberOfLines={1}
				style={settingStyles.primaryText(theme, { flex: undefined })}>{title}</Text>
			<TextInput
				style={{
					flex: 1,
					textAlign: 'right',
					color: theme.primaryText,
					fontSize: size.text.medium,
					height: '100%',
					...Platform.select({
						web: { outline: 'none' }
					}),
					overflow: 'hidden',
				}}
				multiline={false}
				placeholder={placeholder}
				placeholderTextColor={theme.secondaryText}
				autoFocus={false}
				autoCorrect={false}
				autoComplete={autoComplete}
				autoCapitalize="none"
				value={value}
				inputMode={inputMode}
				secureTextEntry={secureTextEntry === undefined ? isPassword : secureTextEntry}
				onChangeText={value => onChangeText(value)}
			/>
		</View>
	)
}

export default OptionInput;