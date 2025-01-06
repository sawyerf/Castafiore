import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'

import { ThemeContext } from '~/contexts/theme'

const ButtonText = ({ text, onPress, disabled = false }) => {
	const theme = React.useContext(ThemeContext)

	return (
		<View style={styles.main}>
			<Pressable
				style={styles.button}
				onPress={onPress}
				disabled={disabled}
			>
				<Text style={styles.text(theme)}>{text}</Text>
			</Pressable>
		</View>
	)
}

const styles = StyleSheet.create({
	main: {
		flexDirection: 'row',
		justifyContent: 'center',
		width: '100%',
		marginBottom: 20
	},
	button: ({ pressed }) => ({
		opacity: pressed ? 0.5 : 1,
		width: '100%',
		height: 50,
		alignItems: "center",
		justifyContent: "center",
	}),
	text: theme => ({
		color: theme.primaryTouch,
		fontSize: 17
	})
})

export default ButtonText