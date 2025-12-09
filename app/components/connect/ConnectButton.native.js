import React from 'react'

import { ThemeContext } from '~/contexts/theme'
import ConnectDevices from '~/components/connect/ConnectDevices'
import { useRemote } from '~/contexts/remote'
import IconButton from '~/components/button/IconButton'

const ConnectButton = ({ size = 23, color, style = {} }) => {
	const theme = React.useContext(ThemeContext)
	const remote = useRemote()
	const [modalVisible, setModalVisible] = React.useState(false)

	return (
		<>
			<IconButton
				icon="tv"
				style={style}
				color={remote.isConnected ? theme.primaryTouch : (color || theme.primaryText)}
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