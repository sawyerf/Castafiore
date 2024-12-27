import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { ThemeContext } from '~/contexts/theme'

const Header = ({ title }) => {
	const navigation = useNavigation()
	const theme = React.useContext(ThemeContext)

	return (
		<View style={{ width: '100%' }}>
			<Pressable
				style={({ pressed }) => ({
					opacity: pressed ? 0.5 : 1,
					flexDirection: 'row',
					alignItems: 'center',
					width: 'min-content',
					padding: 20,
				})}
				onPress={() => navigation.goBack()}
			>
				<Icon
					name="angle-left"
					size={34}
					color={theme.primaryLight}
					style={{ paddingEnd: 10}}
				/>
				<Text style={{
					color: theme.primaryLight,
					fontSize: 24,
					fontWeight: 'bold',
					lineHeight: 0,
				}} >
					{title}
				</Text>
			</Pressable>
		</View >
	)
}

export default Header;