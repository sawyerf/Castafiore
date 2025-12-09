import React, { useState, useContext, useEffect, useRef } from 'react'
import { SongContext, SongDispatchContext } from '~/contexts/song'
import { ConfigContext } from '~/contexts/config'
import logger from '~/utils/logger'

import Player from '~/utils/player'
import LocalPlayer from '~/utils/playerLocal'
import UpnpPlayer from '~/utils/playerUpnp'
import ChromecastPlayer from '~/utils/playerChromecast'

const RemoteContext = React.createContext()

export const RemoteProvider = ({ children }) => {
	const [devices, setDevices] = useState([])
	const [selectedDevice, setSelectedDevice] = useState(null)
	const [isConnected, setIsConnected] = useState(false)

	// Playback state shared between players
	const [playbackState, setPlaybackState] = useState({
		position: 0,
		isPlaying: false,
		volume: 50,
	})

	const config = useContext(ConfigContext)
	const song = useContext(SongContext)
	const dispatch = useContext(SongDispatchContext)

	// Refs to track previous state
	const prevSelectedDeviceRef = useRef(null)
	const isTransferringRef = useRef(false)

	// Initialize player router whenever selectedDevice changes
	useEffect(() => {
		if (!config?.url || !Player) return

		const updatePlaybackState = (state) => {
			setPlaybackState(prev => ({ ...prev, ...state }))
		}

		Player.initPlayerRouter(
			{
				selectedDevice,
				devices,
				isConnected,
				currentStatus: playbackState,
				updateStatus: updatePlaybackState
			}
		)
	}, [selectedDevice, devices, isConnected, config?.url])

	// Handle device changes and transfer playback
	useEffect(() => {
		const prevDevice = prevSelectedDeviceRef.current
		const currentDevice = selectedDevice

		// Skip on initial mount or if already transferring
		if (prevDevice === currentDevice || isTransferringRef.current) {
			prevSelectedDeviceRef.current = currentDevice
			return
		}

		// Check if we have something to transfer
		const hasSong = song?.queue && song?.index !== undefined && song?.songInfo
		if (!hasSong || !config?.url) {
			prevSelectedDeviceRef.current = currentDevice
			return
		}

		const transferPlayback = async () => {
			isTransferringRef.current = true

			try {
				// 1. Get the previous player and save its state
				const getPreviousPlayer = () => {
					if (prevDevice === null) return LocalPlayer
					if (prevDevice.type === 'upnp') return UpnpPlayer
					if (prevDevice.type === 'chromecast') return ChromecastPlayer
					return null
				}

				const previousPlayer = getPreviousPlayer()
				let savedState = null

				if (previousPlayer) {
					savedState = await previousPlayer.saveState()
					await previousPlayer.stopSong()
				}

				// 2. Start new player and restore state
				await Player.playSong(config, dispatch, song.queue, song.index)
				await Player.restoreState(savedState)

			} catch (error) {
				logger.error('RemoteContext', 'Transfer failed', error)
			} finally {
				isTransferringRef.current = false
				prevSelectedDeviceRef.current = currentDevice
			}
		}

		transferPlayback()

	}, [selectedDevice])

	const value = React.useMemo(() => ({
		devices,
		selectedDevice,
		isConnected,
		playbackState,
		// Helper functions
		setDevices,
		selectDevice: (device) => {
			setSelectedDevice(device)
			setIsConnected(device !== null)
		},
		updatePlaybackState: (state) => {
			setPlaybackState(prev => ({ ...prev, ...state }))
		},
		setConnected: setIsConnected,
		reset: () => {
			setDevices([])
			setSelectedDevice(null)
			setIsConnected(false)
			setPlaybackState({
				position: 0,
				isPlaying: false,
				volume: 50,
			})
		}
	}), [devices, selectedDevice, isConnected, playbackState])

	return (
		<RemoteContext.Provider value={value}>
			{children}
		</RemoteContext.Provider>
	)
}

export const useRemote = () => {
	const context = useContext(RemoteContext)
	if (!context) {
		throw new Error('useRemote must be used within RemoteProvider')
	}
	return context
}
