import React, { useState, useContext, useMemo, useEffect } from 'react'
import logger from '~/utils/logger'
import { SongContext, SongDispatchContext } from '~/contexts/song'
import { ConfigContext } from '~/contexts/config'

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
		if (!config?.url || !Player || !LocalPlayer) return

		// Initialize player router with current UPNP state
		Player.initPlayerRouter({ selectedDevice, devices, isConnected, currentStatus }, config)

		if (selectedDevice) {
			logger.info('UpnpContext', `UPNP device selected: ${selectedDevice.name}`)

			// If a song is currently playing, transfer it to UPNP
			if (song?.queue && song?.index !== undefined && song?.songInfo) {
				logger.info('UpnpContext', 'Transferring current playback to UPNP')
				// Stop local player first
				LocalPlayer.stopSong().then(() => {
					logger.info('UpnpContext', 'Local player stopped, starting UPNP playback')
					// Start same song on UPNP device
					Player.playSong(config, dispatch, song.queue, song.index)
				})
			} else {
				// No song playing, just stop local player
				LocalPlayer.stopSong().then(() => {
					logger.info('UpnpContext', 'Local player stopped for UPNP mode')
				})
			}
		} else if (song?.queue && song?.index !== undefined && song?.songInfo) {
			// UPNP device deselected - transfer playback back to local player
			logger.info('UpnpContext', 'UPNP device deselected, transferring playback to local player')
			// The router is already updated, so Player.playSong will use LocalPlayer
			Player.playSong(config, dispatch, song.queue, song.index)
		} else {
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
