import React from 'react'
import { Modal, View, Text, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import GoogleCast, { useDevices } from 'react-native-google-cast'

import { discoverDevices as discoverUpnpDevices } from '~/utils/remote/upnp'
import { ThemeContext } from '~/contexts/theme'
import { useRemote } from '~/contexts/remote'
import ButtonMenu from '~/components/settings/ButtonMenu'
import IconButton from '~/components/button/IconButton'
import logger from '~/utils/logger'
import mainStyles from '~/styles/main'
import Player from '~/utils/player'
import settingStyles from '~/styles/settings'

const CLOSE_DELAY_MS = 300

const ConnectDevices = ({ visible, onClose }) => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const theme = React.useContext(ThemeContext)
	const remote = useRemote()
	const [scanningUpnp, setScanningUpnp] = React.useState(false)
	const [upnpError, setUpnpError] = React.useState(null)
	const devices = useDevices()
	const sessionManager = GoogleCast.getSessionManager()
	const [devicesUpnp, setDevicesUpnp] = React.useState([])

	React.useEffect(() => {
		if (scanningUpnp) return
		if (visible) {
			setScanningUpnp(false)
			setUpnpError(null)
			scanUpnpDevices()
		}
	}, [visible])

	const scanUpnpDevices = async () => {
		setScanningUpnp(true)
		setUpnpError(null)
		setDevicesUpnp([])

		try {
			const onDeviceFound = (device) => {
				setDevicesUpnp(prevDevices => {
					if (remote.selectedDevice?.id === device.id || prevDevices.some(d => d.id === device.id)) {
						return prevDevices
					}
					return [...prevDevices, device]
				})
			}

			await discoverUpnpDevices(onDeviceFound)

		} catch (error) {
			logger.error('ConnectDevices', 'UPNP scan error:', error)
			setUpnpError(error.message || t('Error scanning for devices'))
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
		// Stop remote playback before disconnecting
		if (remote.selectedDevice?.type === 'upnp') {
			await Player.stopSong()
		}

		remote.selectDevice(null)
		setUpnpError(null)
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
					{/* UPNP Error */}
					{upnpError && devicesUpnp.length === 0 && (
						<View style={{
							padding: 12,
							backgroundColor: theme.secondaryBack,
							borderRadius: 8,
							marginBottom: 10,
							borderLeftWidth: 3,
							borderLeftColor: '#ff6b6b',
						}}>
							<Text style={mainStyles.smallText(theme.secondaryText)}>
								{upnpError}
							</Text>
						</View>
					)}

					<View style={settingStyles.optionsContainer(theme, true)}>
						<ButtonMenu
							title={t('My device')}
							icon="mobile"
							onPress={handleDisconnect}
							disabled={!remote.selectedDevice && devices.length === 0}
						/>

						{
							devicesUpnp.map((device, index) => (
								<ButtonMenu
									key={device.id || index}
									title={device.name}
									endText={device.manufacturer || ''}
									icon="volume-up"
									onPress={() => handleSelectDevice(device)}
									isLast={index === devicesUpnp.length - 1}
								/>
							))
						}
						{
							devices.map((device, index) => (
								<ButtonMenu
									key={device.id || index}
									title={device.friendlyName || t('Chromecast Device')}
									icon="tv"
									onPress={async () => {
										sessionManager.startSession(device.deviceId)
										console.log('chibre', await sessionManager.getCurrentCastSession())
										remote.selectDevice({
											...device,
											type: 'chromecast',
										})
									}}
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