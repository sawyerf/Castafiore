import React from 'react'
import { Modal, View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import Icon from 'react-native-vector-icons/FontAwesome'

import mainStyles from '~/styles/main'
import settingStyles from '~/styles/settings'
import { ThemeContext } from '~/contexts/theme'
import { useUpnp } from '~/contexts/upnp'
import ButtonMenu from '~/components/settings/ButtonMenu'
import size from '~/styles/size'
import { discoverDevices } from '~/utils/upnp.native'

const ConnectDevices = ({ visible, onClose }) => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const theme = React.useContext(ThemeContext)
	const upnp = useUpnp()
	const [scanning, setScanning] = React.useState(false)

	const scanDevices = async () => {
		setScanning(true)
		upnp.setDevices([])

		try {
			const onDeviceFound = (device) => {
				upnp.setDevices(prevDevices => {
					if (upnp.selectedDevice?.id === device.id || prevDevices.some(d => d.id === device.id)) {
						return prevDevices
					}
					return [...prevDevices, device]
				})
			}

			await discoverDevices(onDeviceFound)
		} catch (error) {
			console.error('UPNP scan error:', error)
		} finally {
			setScanning(false)
		}
	}

	React.useEffect(() => {
		if (visible) {
			scanDevices()
		}
	}, [visible])

	const handleSelectDevice = (device) => {
		upnp.selectDevice(device)
		setTimeout(onClose, 300)
	}

	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent={false}
			onRequestClose={onClose}
		>
			<View style={[mainStyles.mainContainer(theme), { paddingTop: insets.top }]}>
				{/* Header avec bouton de fermeture */}
				<View style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: 15,
					borderBottomWidth: 1,
					borderBottomColor: theme.separator || theme.secondaryBack,
				}}>
					<Text style={{
						fontSize: 20,
						fontWeight: 'bold',
						color: theme.primaryText,
						flex: 1,
					}}>
						{t("UPNP/DLNA Devices")}
					</Text>
					<Pressable
						onPress={onClose}
						style={({ pressed }) => ([
							mainStyles.opacity({ pressed }),
							{
								padding: 8,
								borderRadius: 20,
								backgroundColor: theme.secondaryBack,
							}
						])}
					>
						<Icon name="times" size={20} color={theme.secondaryText} />
					</Pressable>
				</View>

				<ScrollView style={{ flex: 1 }}>
					<View style={[settingStyles.contentMainContainer, { paddingTop: 10 }]}>
						<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 10 }}>
							<Text style={settingStyles.titleContainer(theme)}>{t('Available Devices')}</Text>
							<Pressable
								onPress={scanDevices}
								disabled={scanning}
								style={({ pressed }) => ([
									mainStyles.opacity({ pressed }),
									{
										padding: 10,
										backgroundColor: theme.primaryTouch,
										borderRadius: 5,
									}
								])}
							>
								<Icon name="refresh" size={size.icon.tiny} color={theme.innerTouch} />
							</Pressable>
						</View>
						{upnp.selectedDevice && (
							<View style={[settingStyles.optionsContainer(theme), { marginBottom: 10 }]}>
								<View style={settingStyles.optionItem(theme, false)}>
									<View
										style={{
											height: '60%',
											aspectRatio: 1,
											marginRight: 15,
											backgroundColor: theme.primaryTouch,
											borderRadius: 5,
											alignItems: 'center',
											justifyContent: 'center',
										}}>
										<Icon name="check" size={18} color={theme.innerTouch} />
									</View>
									<View style={{ flex: 1 }}>
										<Text style={settingStyles.primaryText(theme)}>
											{t('Currently Selected')}
										</Text>
										<Text style={{ color: theme.secondaryText, fontSize: size.text.small }}>
											{upnp.selectedDevice.name}
										</Text>
									</View>
									<Pressable
										onPress={() => upnp.selectDevice(null)}
										style={({ pressed }) => ([mainStyles.opacity({ pressed }), { padding: 5 }])}
									>
										<Icon name="times" size={size.icon.tiny} color={theme.secondaryText} />
									</Pressable>
								</View>
							</View>
						)}
						{/* Show scanning indicator */}
						{scanning && (
							<View style={{ padding: 20, alignItems: 'center' }}>
								<ActivityIndicator size="large" color={theme.primaryTouch} />
								<Text style={{ color: theme.secondaryText, marginTop: 10 }}>
									{t('Scanning for devices...')}
								</Text>
							</View>
						)}

						{/* Show device list (can appear during scan) */}
						{upnp.devices.length > 0 && (
							<View style={settingStyles.optionsContainer(theme)}>
								{upnp.devices.map((device, index) => (
									<ButtonMenu
									key={device.id || index}
									title={device.name}
									endText={device.manufacturer || ''}
									icon="tv"
									onPress={() => handleSelectDevice(device)}
									isLast={index === upnp.devices.length - 1}
									/>
								))}
							</View>
						)}

						{/* Show "no devices" message only when not scanning and list is empty */}
						{!scanning && upnp.devices.length === 0 && (
							<View style={{ padding: 40, alignItems: 'center' }}>
								<Icon name="search" size={40} color={theme.secondaryText} />
								<Text style={{ color: theme.secondaryText, marginTop: 10, textAlign: 'center' }}>
									{t('No UPNP/DLNA devices found on the network')}
								</Text>
								<Text style={{ color: theme.secondaryText, marginTop: 10, fontSize: 12, textAlign: 'center' }}>
									{t('Make sure your device is on the same WiFi network and that UPNP/DLNA is enabled on your media device.')}
								</Text>
							</View>
						)}
						<Text style={[settingStyles.description(theme), { marginTop: 10, marginBottom: insets.bottom + 20 }]}>
							{t('UPNP/DLNA allows you to stream music to compatible devices on your network such as speakers, TVs, and media receivers.')}
						</Text>
					</View>
				</ScrollView>
			</View>
		</Modal>
	)
}

export default ConnectDevices
