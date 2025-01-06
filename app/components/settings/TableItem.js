import React from 'react'
import { Text, View } from 'react-native'

import { ThemeContext } from '~/contexts/theme'
import settingStyles from '~/styles/settings'
import size from '~/styles/size';

const TableItem = ({ title, value, isLast = false }) => {
	const theme = React.useContext(ThemeContext)

	return (
		<View style={[settingStyles.optionItem(theme, isLast), {
			justifyContent: 'space-between'
		}]} >
			<Text
				numberOfLines={1}
				style={[settingStyles.primaryText(theme, { flex: undefined }), { maxWidth: '80%' }]}
			>{title}</Text>
			<Text
				numberOfLines={1}
				style={{ color: theme.primaryLight, fontSize: size.text.medium, textAlign: 'right' }}
			>{value}</Text>
		</View>
	)
}

export default TableItem
