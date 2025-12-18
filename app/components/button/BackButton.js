import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import IconButton from '~/components/button/IconButton'
import size from '~/styles/size'

const BackButton = () => {
	const navigation = useNavigation()
	const insets = useSafeAreaInsets()

	return (
		<IconButton
			style={{
				position: 'absolute',
				top: insets.top,
				left: insets.left,
				padding: 20,
				zIndex: 2,
			}} onPress={() => navigation.goBack()}
			icon="chevron-left"
			size={size.icon.small}
			color="#fff"
		/>
	)
}

export default BackButton