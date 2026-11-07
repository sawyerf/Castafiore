import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

import Icon from '~/components/Icon'

import { useTheme } from '~/contexts/theme'
import mainStyles from '~/styles/main'

// Default screen reader label per icon. Pass `label` when the icon is ambiguous.
const labels = {
	'play': 'Play',
	'pause': 'Pause',
	'step-forward': 'Next song',
	'step-backward': 'Previous song',
	'ellipsis-h': 'More options',
	'chevron-left': 'Back',
	'angle-left': 'Back',
	'heart': 'Favorite',
	'heart-o': 'Favorite',
	'random': 'Shuffle',
	'repeat': 'Repeat',
	'refresh': 'Refresh',
	'plus': 'Add',
	'close': 'Close',
	'times': 'Close',
	'search': 'Search',
	'bell-o': 'Fresh releases',
	'expand': 'Expand',
	'trash': 'Delete',
	'trash-o': 'Delete',
	'pencil': 'Edit',
	'share': 'Share',
}

const IconButton = ({ icon, size = 23, color = undefined, label = undefined, style = {}, styleIcon = {}, pressEffect = true, onPress, onLongPress = null, delayLongPress = 200 }) => {
	const theme = useTheme()
	const { t } = useTranslation()
	const accessibilityLabel = label ?? (labels[icon] ? t(labels[icon]) : undefined)
	return (
		<Pressable
			style={({ pressed }) => ([mainStyles.opacity({ pressed, enable: pressEffect }), { justifyContent: 'center' }, StyleSheet.flatten(style)])}
			onLongPress={onLongPress}
			delayLongPress={delayLongPress}
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			hitSlop={10}
			onContextMenu={(ev) => {
				ev.stopPropagation()
				ev.preventDefault()
				if (onLongPress) onLongPress()
			}}
		>
			<Icon name={icon} size={size} color={color ? color : theme.primaryTouch} style={styleIcon} />
		</Pressable>
	)
}

export default IconButton