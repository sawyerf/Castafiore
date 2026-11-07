import React from 'react'
import { Text, View, Pressable } from 'react-native'

import { useTheme } from '~/contexts/theme'
import Icon from '~/components/Icon'
import mainStyles from '~/styles/main'
import size from '~/styles/size'

// Icon, one sentence and an optional action, for empty lists and errors.
const EmptyState = ({ icon, text, actionText, onAction }) => {
	const theme = useTheme()

	return (
		<View style={{ alignItems: 'center', padding: 30, gap: 12 }}>
			<Icon name={icon} size={48} color={theme.secondaryText} />
			<Text style={{ color: theme.secondaryText, fontSize: size.text.medium, textAlign: 'center' }}>{text}</Text>
			{actionText ? (
				<Pressable
					accessibilityRole="button"
					onPress={onAction}
					style={({ pressed }) => ([mainStyles.opacity({ pressed }), {
						backgroundColor: theme.secondaryTouch,
						paddingVertical: 8,
						paddingHorizontal: 18,
						borderRadius: size.radius.circle,
					}])}
				>
					<Text style={{ color: theme.innerTouch, fontWeight: 'bold' }}>{actionText}</Text>
				</Pressable>
			) : null}
		</View>
	)
}

export default EmptyState
