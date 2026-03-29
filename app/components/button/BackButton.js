import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '~/contexts/theme'

import IconButton from '~/components/button/IconButton'
import size from '~/styles/size'

const BackButton = () => {
	const navigation = useNavigation()
	const insets = useSafeAreaInsets()
	const theme = useTheme()

	return (
		<IconButton
			style={{
				position: 'absolute',
				width: 50,
				height: 50,
				top: insets.top,
				left: insets.left,
				borderRadius: '50%',
				padding: 10,
				margin: 10,
				zIndex: 2,
				alignItems: 'center',
				backgroundColor: `${theme.backgroundTouch}c0`, // add 75% opacity
			}} onPress={() => navigation.goBack()}
			icon="chevron-left"
			size={size.icon.small}
			color={theme.primaryTouch}
		/>
	)
}

export default BackButton
