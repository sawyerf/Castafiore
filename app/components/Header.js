import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { ThemeContext } from '~/contexts/theme'
import IconButton from '~/components/button/IconButton'
import size from '~/styles/size';

const Header = ({ title, marginBottom=30 }) => {
	const navigation = useNavigation()
	const theme = React.useContext(ThemeContext)

	return (
		<View style={[styles.header, { marginBottom }]}>
			<Text numberOfLines={1} style={styles.title(theme)}>
				{title}
			</Text>
			<IconButton
				icon="angle-left"
				size={34}
				color={theme.primaryText}
				style={styles.backButton}
				onPress={() => navigation.goBack()}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	header: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		height: 70
	},
	title: theme => ({
		color: theme.primaryText,
		fontSize: size.text.large,
		fontWeight: 'bold',
		flex: 1,
		textAlign: 'center',
	}),
	backButton: {
		position: 'absolute',
		left: 0,
		top: 0,
		paddingHorizontal: 20,
		height: 70,
	}
})

export default Header;