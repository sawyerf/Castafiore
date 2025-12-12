import React from 'react'
import { Modal, View, Text, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import GoogleCast, { useDevices } from 'react-native-google-cast'

import { discoverDevices as discoverUpnpDevices } from '~/utils/remote/upnp'
import { ThemeContext } from '~/contexts/theme'
import { useRemote } from '~/contexts/remote'
import SelectItem from '~/components/settings/SelectItem'
import IconButton from '~/components/button/IconButton'
import logger from '~/utils/logger'
import mainStyles from '~/styles/main'
import settingStyles from '~/styles/settings'

const CLOSE_DELAY_MS = 300

const ConnectDevices = ({ visible, onClose }) => {
	const { t } = useTranslation()
	const devices = useDevices()
	const insets = useSafeAreaInsets()
	const remote = useRemote()
	const theme = React.useContext(ThemeContext)
	const [devicesUpnp, setDevicesUpnp] = React.useState([])
	const [scanningUpnp, setScanningUpnp] = React.useState(false)
	const [upnpError, setUpnpError] = React.useState(null)

	React.useEffect(() => {
		if (scanningUpnp) return
		if (visible) {
			setScanningUpnp(false)
			scanUpnpDevices()
		}
	}, [visible])

	const scanUpnpDevices = async () => {
		setScanningUpnp(true)
		setDevicesUpnp([])

		try {
			await discoverUpnpDevices((device) => {
				setDevicesUpnp(prevDevices => {
					if (remote.selectedDevice?.id === device.id || prevDevices.some(d => d.id === device.id)) {
						return prevDevices
					}
					return [...prevDevices, device]
				})
			})
		} catch (error) {
			logger.error('ConnectDevices', 'UPNP scan error:', error)
		} finally {
			setScanningUpnp(false)
		}
	}

	const handleSelectDevice = (device) => {
		// UPNP device
		remote.selectDevice(device)
		setTimeout(onClose, CLOSE_DELAY_MS)
	}

	const handleDisconnect = async () => {
		remote.selectDevice(null)
		setUpnpError(null)
	}
	
	const refresh = () => {
		// GoogleCast rescan
		const discoveryManager = GoogleCast.getDiscoveryManager()
		discoveryManager.stopDiscovery()
		discoveryManager.startDiscovery()
		// UPNP rescan
		scanUpnpDevices()
	}

	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent={false}
			onRequestClose={onClose}
		>
			<ScrollView
				style={mainStyles.mainContainer(theme)}
				contentContainerStyle={mainStyles.contentMainContainer(insets)}
			>
				{/* Header */}
				<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 10, marginBottom: 20 }}>
					<Text style={mainStyles.mainTitle(theme)}>
						{t("Remote Devices")}
					</Text>
					<IconButton
						icon="close"
						onPress={onClose}
						color={theme.primaryText}
						style={{
							padding: 8,
							borderRadius: 20,
						}}
					/>
				</View>

				<View style={settingStyles.contentMainContainer}>
					<IconButton
						icon="refresh"
						onPress={refresh}
						color={theme.primaryText}
						style={{
							padding: 8,
						}}
					/>
					<View style={settingStyles.optionsContainer(theme, true)}>
						<SelectItem
							text={t('My device')}
							icon="mobile"
							onPress={handleDisconnect}
							isSelect={!remote.selectedDevice}
						/>

						{
							devicesUpnp.map((device, index) => (
								<SelectItem
									key={device.id || index}
									text={device.name}
									icon="volume-up"
									onPress={() => handleSelectDevice(device)}
									isSelect={remote.selectedDevice?.id === device.id}
									isLast={index === devicesUpnp.length - 1}
								/>
							))
						}
						{
							devices.map((device, index) => (
								<SelectItem
									key={device.deviceId || index}
									text={device.friendlyName || t('Chromecast Device')}
									icon="tv"
									onPress={async () => {
										const sessionManager = GoogleCast.getSessionManager()
										await sessionManager.startSession(device.deviceId)
										remote.selectDevice({
											id: device.deviceId,
											type: 'chromecast',
										})
									}}
									isSelect={remote.selectedDevice?.id === device.deviceId}
									isLast={index === devices.length - 1}
								/>
							))
						}
					</View>

					<Text style={settingStyles.description(theme)}>
						{t('Stream music to compatible devices: Chromecast, UPNP/DLNA speakers, TVs, and media receivers.')}
					</Text>
				</View>
			</ScrollView>
		</Modal >
	)
}

export default ConnectDevices