import React from 'react'
import { Modal, View, Text, ScrollView, Platform, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import GoogleCast, { useDevices } from 'react-native-google-cast'

import { discoverDevices } from '~/utils/remote/upnpSsdp'
import { useTheme } from '~/contexts/theme'
import { useRemote } from '~/contexts/remote'
import logger from '~/utils/logger'
import mainStyles from '~/styles/main'
import RotateIconButton from '~/components/button/RotateIconButton'
import SelectItem from '~/components/settings/SelectItem'
import settingStyles from '~/styles/settings'

const DiscoveryPanel = ({ visible, onClose }) => {
	const { t } = useTranslation()
	const devices = useDevices()
	const insets = useSafeAreaInsets()
	const remote = useRemote()
	const theme = useTheme()
	const [devicesUpnp, setDevicesUpnp] = React.useState([])
	const scanningUpnp = React.useRef(false)

	React.useEffect(() => {
		if (visible) scanUpnpDevices()
	}, [visible])

	const scanUpnpDevices = async () => {
		if (scanningUpnp.current) return
		scanningUpnp.current = true
		setDevicesUpnp([])

		try {
			discoverDevices((device) => {
				setDevicesUpnp((prevDevices) => {
					// Avoid duplicates
					if (remote.selectedDevice?.id === device.id || prevDevices.find((d) => d.id === device.id)) {
						return prevDevices
					}
					return [...prevDevices, device]
				})
			})
		} catch (error) {
			logger.error('ConnectDevices', 'UPNP scan error:', error)
		}
		scanningUpnp.current = false
	}

	const refresh = (rotate) => {
		rotate()
		// GoogleCast rescan
		const discoveryManager = GoogleCast.getDiscoveryManager()
		discoveryManager.stopDiscovery()
		discoveryManager.startDiscovery()
		// UPNP rescan
		scanUpnpDevices()
	}

	const connect = (device) => {
		if (remote.selectDevice(device)) onClose()
	}

	return (
		<Modal
			transparent={true}
			visible={visible}
			statusBarTranslucent={true}
			navigationBarTranslucent={Platform.OS === 'android' && parseInt(Platform.Version, 10) > 34 ? false : true}
			onRequestClose={onClose}
		>
			<ScrollView
				style={{
					width: '100%',
					height: '100%',
					backgroundColor: 'rgba(0,0,0,0.5)',
				}}
				contentContainerStyle={{
					justifyContent: 'flex-end',
					minHeight: '100%',
				}}
			>
				<Pressable
					onPress={onClose}
					style={{
						width: '100%',
						minHeight: insets.top + 100,
						flex: 1,
					}}
				/>
				{/* Header */}
				<View style={{
					width: "100%",
					minHeight: '50%',
					paddingTop: 15,
					paddingBottom: insets.bottom > 15 ? insets.bottom : 15,
					backgroundColor: theme.primaryBack,
					borderTopLeftRadius: 20,
					borderTopRightRadius: 20,
				}}
				>
					<View style={settingStyles.contentMainContainer}>
						<View style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'space-between',
							marginTop: 10,
							marginBottom: 20,
							width: '100%',
						}}>
							<Text style={[mainStyles.mainTitle(theme), { marginBottom: 0, marginTop: 0, marginStart: 0 }]}>
								{t("Remote Devices")}
							</Text>
							<RotateIconButton
								icon="refresh"
								onPress={refresh}
								color={theme.primaryText}
								style={{
									padding: 8,
									borderRadius: 20,
								}}
							/>
						</View>

						<Text style={settingStyles.titleContainer(theme)}>
							{t('Devices')}
						</Text>

						<View style={settingStyles.optionsContainer(theme, true)}>
							<SelectItem
								text={t('My device')}
								icon="mobile"
								onPress={() => connect(null)}
								isSelect={!remote.selectedDevice}
							/>
							{
								remote.selectedDevice?.type === 'upnp' && (
									<SelectItem
										text={remote.selectedDevice.name || t('Device')}
										icon={remote.selectedDevice.type === 'chromecast' ? 'tv' : 'volume-up'}
										isSelect={true}
										isLast={devices.length === 0 && devicesUpnp.length === 0}
									/>
								)
							}
							{
								devices.map((device, index) => (
									<SelectItem
										key={device.deviceId || index}
										text={device.friendlyName || t('Chromecast Device')}
										icon="tv"
										onPress={() => connect({
											id: device.deviceId,
											name: device.friendlyName || t('Chromecast Device'),
											type: 'chromecast',
										})}
										isSelect={remote.selectedDevice?.id === device.deviceId}
										isLast={index === devices.length - 1}
									/>
								))
							}
							{
								devicesUpnp.map((device, index) => (
									<SelectItem
										key={device.id || index}
										text={device.name}
										icon="volume-up"
										onPress={() => connect(device)}
										isSelect={remote.selectedDevice?.id === device.id}
										isLast={index === devicesUpnp.length - 1}
									/>
								))
							}
						</View>

						<Text style={settingStyles.description(theme)}>
							{t('Stream music to compatible devices: Chromecast, UPNP/DLNA speakers, TVs, and media receivers.')}
						</Text>
					</View>
				</View>
			</ScrollView>
		</Modal >
	)
}

export default DiscoveryPanel