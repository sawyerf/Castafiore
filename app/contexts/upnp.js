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

	// Handle device selection changes and player routing
	useEffect(() => {
		if (Platform.OS === 'web' || !config?.url || !Player || !LocalPlayer) return

		// Initialize player router with current state
		const updateStatus = (status) => {
			setCurrentStatus(prev => ({ ...prev, ...status }))
		}
		Player.initPlayerRouter({ selectedDevice, devices, isConnected, currentStatus, updateStatus }, config)

		const { State } = Player
		const wasPlaying = song?.state === State.Playing
		const hasSong = song?.queue && song?.index !== undefined && song?.songInfo
		const shouldTransfer = hasSong && song.state !== State.Stopped && song.state !== State.None

		// Helper to transfer and preserve playback state
		const transferPlayback = async () => {
			try {
				await Player.playSong(config, dispatch, song.queue, song.index)
				if (!wasPlaying) {
					await Player.pauseSong()
				}
			} catch (error) {
				logger.error('UpnpContext', 'Transfer playback failed', error)
			}
		}

		if (selectedDevice) {
			LocalPlayer.stopSong().catch((error) => {
				logger.error('UpnpContext', 'Failed to stop local player', error)
			})

			if (shouldTransfer) {
				transferPlayback()
			}
		} else if (shouldTransfer) {
			transferPlayback()
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
