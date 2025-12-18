import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'

import { useTheme } from '~/contexts/theme'
import mainStyles from '~/styles/main'
import size from '~/styles/size'

const ButtonText = ({ text, onPress, disabled = false }) => {
	const theme = useTheme()

	return (
		<View style={styles.main}>
			<Pressable
				style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.button])}
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
	button: {
		width: '100%',
		height: 50,
		alignItems: "center",
		justifyContent: "center",
	},
	text: theme => ({
		color: theme.primaryTouch,
		fontSize: size.text.medium
	})
})

export default ButtonText