import React from 'react'
import { View, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import IconButton from '~/components/button/IconButton'

import { ThemeContext } from '~/contexts/theme'
import mainStyles from '~/styles/main'

const Header = ({ title }) => {
	const navigation = useNavigation()
	const theme = React.useContext(ThemeContext)

	return (
		<View
			style={{
				flexDirection: 'row',
				width: '100%',
				alignItems: 'center',
			}} >
			<IconButton
				icon="chevron-left"
				size={23}
				color={theme.primaryLight}
				style={{ padding: 20, paddingEnd: 15, alignItems: 'center' }}
				onPress={() => navigation.goBack()}
			/>
			<Text style={{ ...mainStyles.mainTitle(theme), margin: undefined, marginTop: undefined }}>{title}</Text>
		</View>
	)
}

export default Header;