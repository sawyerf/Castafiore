import React from 'react'
import { View, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import IconButton from '~/components/button/IconButton'
import presStyles from '~/styles/pres'
import { ThemeContext } from '~/contexts/theme'

const Header = ({ title }) => {
	const navigation = useNavigation()
	const theme = React.useContext(ThemeContext)

	return (
		<View
			style={{
				flexDirection: 'row',
				width: '100%',
			}} >
			<IconButton
				icon="chevron-left"
				size={23}
				color={theme.primaryLight}
				style={{ padding: 20, alignItems: 'center' }}
				onPress={() => navigation.goBack()}
			/>
			<Text style={{ ...presStyles.title(theme), marginStart: 0, width: undefined }}>{title}</Text>
		</View>
	)
}

export default Header;