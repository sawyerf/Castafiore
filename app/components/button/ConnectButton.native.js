import React from 'react'
import { ActivityIndicator } from 'react-native'

import { ThemeContext } from '~/contexts/theme'
import { useRemote } from '~/contexts/remote'
import DiscoveryPanel from '~/components/popup/DiscoveryPanel'
import IconButton from '~/components/button/IconButton'

const ConnectButton = ({ size = 23, color = null, style = {} }) => {
	const theme = React.useContext(ThemeContext)
	const remote = useRemote()
	const [modalVisible, setModalVisible] = React.useState(false)

	return (
		<>
			{
				remote.status === 'transferring' ? (
					<ActivityIndicator size={'small'} color={color} style={style} />
				) : (
					<IconButton
						icon="tv"
						style={style}
						color={remote.selectedDevice ? theme.primaryTouch : (color || theme.primaryText)}
						size={size}
						onPress={() => setModalVisible(true)}
					/>
				)
			}
			<DiscoveryPanel
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
			/>
		</>
	)
}

export default ConnectButton