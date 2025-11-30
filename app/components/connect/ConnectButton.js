import React from 'react'
import { StyleSheet, Platform } from 'react-native'

import { ThemeContext } from '~/contexts/theme'
import mainStyles from '~/styles/main'
import ConnectDevices from './ConnectDevices'
import { useUpnp } from '../../contexts/upnp'
import IconButton from '~/components/button/IconButton'

const ConnectButton = ({ size = 23, color, style = {} }) => {
	const theme = React.useContext(ThemeContext)
	const upnp = useUpnp()
	const [modalVisible, setModalVisible] = React.useState(false)

	// UPNP/DLNA is not supported on web
	if (Platform.OS === 'web') return null

	return (
		<>
			<IconButton
				icon="tv"
				style={style}
				color={upnp.isConnected ? theme.primaryTouch : (color || theme.primaryText)}
				size={size}
				onPress={() => setModalVisible(true)}
			/>
			<ConnectDevices
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
			/>
		</>
	)
}

export default ConnectButton