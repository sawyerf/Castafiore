import React, { useState, useContext, useEffect, useRef } from 'react'
import { SongContext, SongDispatchContext } from '~/contexts/song'
import { ConfigContext } from '~/contexts/config'
import logger from '~/utils/logger'

import Player from '~/utils/player'
import LocalPlayer from '~/utils/player/playerLocal'
import UpnpPlayer from '~/utils/player/playerUpnp'
import CastPlayer from '~/utils/player/playerCast'

const RemoteContext = React.createContext()

export const RemoteProvider = ({ children }) => {
	const [selectedDevice, setSelectedDevice] = useState(null)

	// Playback state shared between players

	const config = useContext(ConfigContext)
	const song = useContext(SongContext)
	const dispatch = useContext(SongDispatchContext)

	// Refs to track previous state
	const prevSelectedDeviceRef = useRef(null)
	const isTransferringRef = useRef(false)

	// Initialize player router whenever selectedDevice changes
	useEffect(() => {
		if (!config?.url || !Player) return

		Player.initPlayerRouter(
			{
				selectedDevice,
			}
		)
	}, [selectedDevice, config?.url])

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

			// 1. Get the previous player and save its state
			const getPreviousPlayer = () => {
				if (prevDevice === null) return LocalPlayer
				if (prevDevice.type === 'chromecast') return CastPlayer
				if (prevDevice.type === 'upnp') return UpnpPlayer
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

			isTransferringRef.current = false
			prevSelectedDeviceRef.current = currentDevice
		}

		transferPlayback()

	}, [selectedDevice])

	const value = React.useMemo(() => ({
		selectedDevice,
		selectDevice: (device) => {
			setSelectedDevice(device)
		},
		reset: () => {
			setSelectedDevice(null)
		}
	}), [selectedDevice])

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
