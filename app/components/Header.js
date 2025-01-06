import React from 'react'
import { View, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { ThemeContext } from '~/contexts/theme'
import IconButton from '~/components/button/IconButton'
import size from '~/styles/size';

const Header = ({ title }) => {
	const navigation = useNavigation()
	const theme = React.useContext(ThemeContext)

	return (
		<View style={{
			width: '100%',
			flexDirection: 'row',
			alignItems: 'center',
			height: 70
		}}>
			<Text numberOfLines={1}
				style={{
					color: theme.primaryLight,
					fontSize: size.text.large,
					fontWeight: 'bold',
					flex: 1,
					textAlign: 'center',
				}} >
				{title}
			</Text>
			<IconButton
				icon="angle-left"
				size={34}
				color={theme.primaryLight}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					paddingHorizontal: 20,
					height: 70,
				}}
				onPress={() => navigation.goBack()}
			/>
		</View >
	)
}

export default Header;