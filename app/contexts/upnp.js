import React, { useState, useContext, useMemo, useEffect } from 'react'
import { Platform } from 'react-native'
import { SongContext, SongDispatchContext } from '~/contexts/song'
import { ConfigContext } from '~/contexts/config'
import logger from '~/utils/logger'

const UpnpContext = React.createContext()

export const defaultUpnp = {
	devices: [],
	selectedDevice: null,
	isConnected: false,
	currentStatus: {
		state: 'stopped', // 'playing', 'paused', 'stopped'
		volume: 50,
		position: 0,
		duration: 0,
	}
}

export const UpnpProvider = ({ children, Player, LocalPlayer }) => {
	const [devices, setDevices] = useState([])
	const [selectedDevice, setSelectedDevice] = useState(null)
	const [isConnected, setIsConnected] = useState(false)
	const [currentStatus, setCurrentStatus] = useState(defaultUpnp.currentStatus)

	// Access existing contexts
	const config = useContext(ConfigContext)
	const song = useContext(SongContext)
	const dispatch = useContext(SongDispatchContext)

	// Handle UPNP device selection changes and player routing
	useEffect(() => {
		if (Platform.OS === 'web' || !config?.url || !Player || !LocalPlayer) return

		// Initialize player router with current UPNP state
		const updateStatus = (status) => {
			setCurrentStatus(prev => ({ ...prev, ...status }))
		}
		Player.initPlayerRouter({ selectedDevice, devices, isConnected, currentStatus, updateStatus }, config)

		if (selectedDevice) {
			logger.info('UpnpContext', `UPNP device selected: ${selectedDevice.name}`)
			// If a song is currently playing, transfer it to UPNP
			if (song?.queue && song?.index !== undefined && song?.songInfo) {
				LocalPlayer.stopSong()
					.then(() => {
						logger.info('UpnpContext', 'Local player stopped, starting UPNP playback')
						Player.playSong(config, dispatch, song.queue, song.index)
					})
					.catch((error) => {
						logger.error('UpnpContext', 'Failed to stop local player, attempting UPNP playback anyway', error)
						// Try to start UPNP even if local stop failed
						Player.playSong(config, dispatch, song.queue, song.index)
					})
			} else {
				LocalPlayer.stopSong().catch((error) => {
					logger.error('UpnpContext', 'Failed to stop local player', error)
				})
			}
		} else if (song?.queue && song?.index !== undefined && song?.songInfo) {
			// UPNP device deselected - transfer playback back to local player
			logger.info('UpnpContext', 'UPNP device deselected, transferring to local player')
			Player.playSong(config, dispatch, song.queue, song.index)
				.catch((error) => {
					logger.error('UpnpContext', 'Failed to transfer playback to local player', error)
				})
		} else if (!selectedDevice) {
			logger.info('UpnpContext', 'UPNP device deselected, no song to transfer')
		}
	}, [selectedDevice, config?.url])

	const value = useMemo(() => ({
		devices,
		selectedDevice,
		isConnected,
		currentStatus,
		// Helper functions
		setDevices,
		selectDevice: (device) => {
			setSelectedDevice(device)
			setIsConnected(device !== null)
		},
		updateStatus: (status) => {
			setCurrentStatus(prev => ({ ...prev, ...status }))
		},
		setConnected: setIsConnected,
		reset: () => {
			setDevices([])
			setSelectedDevice(null)
			setIsConnected(false)
			setCurrentStatus(defaultUpnp.currentStatus)
		}
	}), [devices, selectedDevice, isConnected, currentStatus])

	return (
		<UpnpContext.Provider value={value}>
			{children}
		</UpnpContext.Provider>
	)
}

export const useUpnp = () => {
	const context = useContext(UpnpContext)
	if (!context) {
		throw new Error('useUpnp must be used within UpnpProvider')
	}
	return context
}
