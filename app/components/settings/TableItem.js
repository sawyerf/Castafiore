import React from 'react'
import { Text, Pressable, Platform } from 'react-native'

import { ThemeContext } from '~/contexts/theme'
import settingStyles from '~/styles/settings'
import size from '~/styles/size';

const objectToString = (obj) => {
	console.log(obj, typeof obj)
	if (obj === null || obj === undefined) {
		return 'N/A'
	} else if (typeof obj === 'object') {
		if (obj instanceof Array) {
			return obj.map(value => objectToString(value)).join(', ')
		} else {
			return Object.keys(obj).map(key => `${key}: ${objectToString(obj[key])}`).join('\n')
		}
	} else if (typeof obj === 'boolean') {
		return obj ? 'True' : 'False'
	} else {
		return obj
	}
}

const TableItem = ({ title, value, isLast = false }) => {
	const theme = React.useContext(ThemeContext)
	const [isCopied, setIsCopied] = React.useState(false)

	const onPress = () => {
		if (Platform.OS === 'web') {
			navigator.clipboard.writeText(value)
			setIsCopied(true)
			setTimeout(() => setIsCopied(false), 1000)
		}
	}

	return (
		<Pressable
			style={[settingStyles.optionItem(theme, isLast), {
				justifyContent: 'space-between'
			}]}
			onPress={onPress}
		>
			<Text
				numberOfLines={1}
				style={[settingStyles.primaryText(theme, { flex: undefined }), {
					maxWidth: '80%',
					width: 'min-content',
				}]}
			>{title}</Text>
			<Text
				numberOfLines={1}
				style={{
					color: isCopied ? theme.primaryLight : theme.secondaryLight,
					fontSize: size.text.medium,
					textAlign: 'right',
					flex: 1,
				}}
			>{isCopied ? 'Copied' : objectToString(value)}</Text>
		</Pressable>
	)
}

export default TableItem
