import React from 'react'
import { Modal, View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import IconFontAwesome from 'react-native-vector-icons/FontAwesome6'
import GoogleCast, { CastButton } from 'react-native-google-cast'

import { discoverDevices as discoverUpnpDevices } from '~/utils/remote/upnp'
import { ThemeContext } from '~/contexts/theme'
import { useRemote } from '~/contexts/remote'
import Player from '~/utils/player'
import ButtonMenu from '~/components/settings/ButtonMenu'
import logger from '~/utils/logger'
import mainStyles from '~/styles/main'
import settingStyles from '~/styles/settings'
import size from '~/styles/size'

const CLOSE_DELAY_MS = 300

const ConnectDevices = ({ visible, onClose }) => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const theme = React.useContext(ThemeContext)
	const remote = useRemote()
	const [scanningUpnp, setScanningUpnp] = React.useState(false)
	const [upnpError, setUpnpError] = React.useState(null)

	// Reset states when modal opens
	React.useEffect(() => {
		if (visible) {
			setScanningUpnp(false)
			setUpnpError(null)
			remote.setDevices([])
		}
	}, [visible])

	const scanUpnpDevices = async () => {
		setScanningUpnp(true)
		setUpnpError(null)
		remote.setDevices([])

		try {
			const onDeviceFound = (device) => {
				remote.setDevices(prevDevices => {
					if (remote.selectedDevice?.id === device.id || prevDevices.some(d => d.id === device.id)) {
						return prevDevices
					}
					return [...prevDevices, device]
				})
			}

			await discoverUpnpDevices(onDeviceFound)

			// Check if no devices found after scan completes
			setTimeout(() => {
				if (remote.devices.length === 0) {
					setUpnpError(t('No UPNP/DLNA devices found'))
				}
			}, 100)
		} catch (error) {
			logger.error('ConnectDevices', 'UPNP scan error:', error)
			setUpnpError(error.message || t('Error scanning for devices'))
		} finally {
			setScanningUpnp(false)
		}
	}


	// Setup Chromecast session listeners
	React.useEffect(() => {
		if (!visible) return

		const sessionManager = GoogleCast.getSessionManager()

		const sessionStartedListener = sessionManager.onSessionStarted(async () => {
			logger.info('ConnectDevices', 'Chromecast session started')

			try {
				const currentSession = await sessionManager.getCurrentCastSession()
				if (currentSession) {
					const device = {
						id: 'chromecast-session',
						name: currentSession.device?.friendlyName || 'Chromecast',
						manufacturer: 'Google',
						serviceUrl: '',
						controlUrl: '',
						type: 'chromecast',
						rawDevice: currentSession.device
					}
					remote.selectDevice(device)
					setTimeout(onClose, CLOSE_DELAY_MS)
				}
			} catch (error) {
				logger.error('ConnectDevices', 'Session check error:', error)
			}
		})

		return () => {
			sessionStartedListener?.remove?.()
		}
	}, [visible, remote, onClose, t])

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
		remote.setDevices([])
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
					<Pressable
						onPress={onClose}
						style={({ pressed }) => ([
							mainStyles.opacity({ pressed }),
							{ padding: 8, borderRadius: 20, backgroundColor: theme.secondaryBack }
						])}
					>
						<Icon name="close" size={20} color={theme.secondaryText} />
					</Pressable>
				</View>

				<View style={settingStyles.contentMainContainer}>
					{/* Show connected device if any */}
					{remote.selectedDevice ? (
						<>
							<Text style={settingStyles.titleContainer(theme)}>
								{t('Connected Device')}
							</Text>
							<View style={settingStyles.optionsContainer(theme)}>
								<View style={[settingStyles.optionItem(theme, true), { height: 70 }]}>
									<View style={{
										width: 50,
										height: 50,
										backgroundColor: theme.primaryTouch,
										borderRadius: 25,
										alignItems: 'center',
										justifyContent: 'center',
										marginRight: 15,
									}}>
										{remote.selectedDevice.type === 'chromecast' ? (
											<IconFontAwesome name="chromecast" size={24} color={theme.innerTouch} />
										) : (
											<Icon name="speaker-wireless" size={24} color={theme.innerTouch} />
										)}
									</View>
									<View style={{ flex: 1 }}>
										<Text style={[settingStyles.primaryText(theme), { fontWeight: '600' }]}>
											{remote.selectedDevice.name}
										</Text>
										<Text style={[mainStyles.smallText(theme.secondaryText)]}>
											{remote.selectedDevice.type === 'chromecast' ? 'Chromecast' : 'UPNP/DLNA'}
										</Text>
									</View>
								</View>
							</View>
							<Pressable
								onPress={handleDisconnect}
								style={({ pressed }) => ([
									mainStyles.opacity({ pressed }),
									{
										padding: 15,
										backgroundColor: theme.primaryTouch,
										borderRadius: 8,
										alignItems: 'center',
										marginBottom: 10,
									}
								])}
							>
								<Text style={{ color: theme.innerTouch, fontSize: size.text.medium, fontWeight: '600' }}>
									{t('Disconnect')}
								</Text>
							</Pressable>
						</>
					) : (
						<>
							{/* Chromecast Button */}
							<View style={{
								position: 'relative',
								padding: 20,
								backgroundColor: theme.secondaryBack,
								borderRadius: 10,
								borderWidth: 1,
								borderColor: theme.primaryTouch,
								marginBottom: 15,
								width: "100%",
							}}>
								<View style={{
									position: 'absolute',
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									justifyContent: 'center',
									alignItems: 'stretch',
								}}>
									<CastButton style={{
										width: '100%',
										height: '100%',
										tintColor: 'transparent',
									}} />
								</View>
								<View style={{ flexDirection: 'row', alignItems: 'center' }} pointerEvents="none">
									<IconFontAwesome name="chromecast" size={24} color={theme.primaryTouch} style={{ marginRight: 15 }} />
									<Text style={settingStyles.primaryText(theme)}>
										{t('Connect to Chromecast device')}
									</Text>
								</View>
							</View>

							{/* UPNP Button */}
							<Pressable
								onPress={scanUpnpDevices}
								disabled={scanningUpnp}
								style={({ pressed }) => ([
									mainStyles.opacity({ pressed }),
									{
										padding: 20,
										backgroundColor: theme.secondaryBack,
										borderRadius: 10,
										borderWidth: 1,
										borderColor: theme.primaryTouch,
										flexDirection: 'row',
										alignItems: 'center',
										marginBottom: upnpError || scanningUpnp || remote.devices.length > 0 ? 10 : 15
									}
								])}
							>
								<Icon name="speaker-wireless" size={24} color={theme.primaryTouch} style={{ marginRight: 15 }} />
								<Text style={[settingStyles.primaryText(theme), { flex: 1 }]}>
									{t('Connect to UPNP/DLNA device')}
								</Text>
								{scanningUpnp && (
									<ActivityIndicator size="small" color={theme.primaryTouch} />
								)}
							</Pressable>

							{/* UPNP Error */}
							{upnpError && remote.devices.length === 0 && (
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

							{/* UPNP Device list */}
							{remote.devices.length > 0 && (
								<View style={[settingStyles.optionsContainer(theme), { marginBottom: 15 }]}>
									{remote.devices.map((device, index) => (
										<ButtonMenu
											key={device.id || index}
											title={device.name}
											endText={device.manufacturer || ''}
											icon="volume-up"
											onPress={() => handleSelectDevice(device)}
											isLast={index === remote.devices.length - 1}
										/>
									))}
								</View>
							)}
						</>
					)}

					<Text style={settingStyles.description(theme)}>
						{t('Stream music to compatible devices: Chromecast, UPNP/DLNA speakers, TVs, and media receivers.')}
					</Text>
				</View>
			</ScrollView>
		</Modal>
	)
}

export default ConnectDevices
