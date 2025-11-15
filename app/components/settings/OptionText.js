import React from 'react'
import { View, TextInput, Platform } from 'react-native'

import { ThemeContext } from '~/contexts/theme'
import settingStyles from '~/styles/settings'
import size from '~/styles/size'

const OptionText = ({ placeholder, value, onChangeText, isPassword, autoComplete = 'off', inputMode = undefined, isLast = false, secureTextEntry = undefined }) => {
	const theme = React.useContext(ThemeContext)

	return (
		<View style={[settingStyles.optionItem(theme, isLast), {
			flexDirection: 'column',
			flex: 1,
			height: undefined,
			alignItems: 'flex-start',
		}]}>
			<TextInput
				style={{
					flex: 1,
					color: theme.primaryText,
					fontSize: size.text.medium,
					maxHeight: 150,
					minHeight: 100,
					lineHeight: 25,
					textAlign: 'left',
					width: '100%',
					marginVertical: 13,
					...Platform.select({
						web: { outline: 'none' }
					}),
				}}
				multiline={true}
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

export default OptionText