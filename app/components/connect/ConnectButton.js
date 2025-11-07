import React from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { ThemeContext } from '~/contexts/theme';
import mainStyles from '~/styles/main';
import ConnectDevices from './ConnectDevices';
import { useUpnp } from '../../contexts/upnp';

const ConnectButton = ({ size = 23, color, style = {}, styleIcon = {}, pressEffect = true, onLongPress, delayLongPress = 200 }) => {
	const theme = React.useContext(ThemeContext)
	const upnp = useUpnp()
	const [modalVisible, setModalVisible] = React.useState(false)

	// UPNP/DLNA is not supported on web
	if (Platform.OS === 'web') return null

	return (
		<>
			<Pressable
				style={({ pressed }) => ([
					mainStyles.opacity({ pressed, enable: pressEffect }),
					{ justifyContent: 'center' },
					StyleSheet.flatten(style)
				])}
				onLongPress={onLongPress}
				delayLongPress={delayLongPress}
				onPress={() => setModalVisible(true)}
				onContextMenu={(ev) => {
					ev.preventDefault()
					onLongPress?.()
				}}
			>
				<Icon
					name="cast"
					size={size}
					color={upnp.isConnected ? theme.primaryTouch : (color || theme.primaryText)}
					style={styleIcon}
				/>
			</Pressable>

			<ConnectDevices
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
			/>
		</>
	)
}

export default ConnectButton;