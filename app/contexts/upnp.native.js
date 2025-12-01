import React, { useState, useContext, useMemo, useEffect, useRef } from 'react'
import { SongContext, SongDispatchContext } from '~/contexts/song'
import { ConfigContext } from '~/contexts/config'
import logger from '~/utils/logger'

import Player from '~/utils/player'
import LocalPlayer from '~/utils/playerLocal'

const UpnpContext = React.createContext()

const defaultUpnp = {
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

export const UpnpProvider = ({ children }) => {
	const [devices, setDevices] = useState([])
	const [selectedDevice, setSelectedDevice] = useState(null)
	const [isConnected, setIsConnected] = useState(false)
	const [currentStatus, setCurrentStatus] = useState(defaultUpnp.currentStatus)

	const config = useContext(ConfigContext)
	const song = useContext(SongContext)
	const dispatch = useContext(SongDispatchContext)

	// Get current playback time directly from LocalPlayer
	const localTime = LocalPlayer.updateTime()

	// Store previous device selection to detect changes
	const prevSelectedDeviceRef = useRef(selectedDevice)

	// Handle device selection changes and player routing
	useEffect(() => {
		if (!config?.url || !Player || !LocalPlayer) return

		const { State } = Player
		const wasPlaying = song?.state === State.Playing
		const hasSong = song?.queue && song?.index !== undefined && song?.songInfo
		const shouldTransfer = hasSong && song.state !== State.Stopped && song.state !== State.None

		// Detect if this is a device selection change (not initial render)
		const isDeviceChange = prevSelectedDeviceRef.current !== selectedDevice
		const wasUpnpActive = prevSelectedDeviceRef.current !== null
		prevSelectedDeviceRef.current = selectedDevice

		// - If switching FROM UPNP: use currentStatus.position (from polling)
		// - If switching FROM Local: use localTime.position (directly from TrackPlayer)
		const currentPosition = wasUpnpActive ? (currentStatus?.position || 0) : (localTime?.position || 0)

		// Initialize player router with current state
		const updateStatus = (status) => {
			setCurrentStatus(prev => ({ ...prev, ...status }))
		}
		Player.initPlayerRouter({ selectedDevice, devices, isConnected, currentStatus, updateStatus }, config)

		if (!isDeviceChange || !shouldTransfer) {
			return
		}

		const transferPlayback = async (toUpnp) => {
			try {
				
				await Player.playSong(config, dispatch, song.queue, song.index)
				
				// UPNP: reset position first to clear device cache
				if (toUpnp) {
					await Player.setPosition(0)
				}

				// Local: wait for track to load before seeking
				if (!toUpnp) {
					await new Promise(resolve => setTimeout(resolve, 150))
				}

				if (currentPosition > 0) {
					await Player.setPosition(currentPosition)
				}

				if (!wasPlaying) {
					await Player.pauseSong()
				}
			} catch (error) {
				logger.error('UpnpContext', `Transfer to ${toUpnp ? 'UPNP' : 'Local'} failed`, error)
			}
		}

		if (selectedDevice) {
			LocalPlayer.pauseSong()
			transferPlayback(true)
		} else {
			transferPlayback(false)
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
