import React from 'react'

import { RemoteContext } from '~/contexts/remote/context'
import { useConfig } from '~/contexts/config'
import { useSong, useSongDispatch } from '~/contexts/song'
import logger from '~/utils/logger'
import Player from '~/utils/player'

const transfer = async (fromDevice, toDevice, config, song, songDispatch) => {
	// Connect to new player
	await Player.connect(toDevice, toDevice?.type || 'local')
		.catch((error) => {
			logger.error('RemoteProvider', 'Error connecting to new player:', error)
			throw error
		})

	// Action on previous player
	const savedState = await Player.saveState()
	await Player.stopSong()
		.catch((error) => logger.error('RemoteProvider', 'Error stopping previous player:', error))
	await Player.disconnect(fromDevice)
		.catch((error) => logger.error('RemoteProvider', 'Error disconnecting from previous player:', error))

	await Player.switchPlayer(toDevice?.type || 'local')

	// Restore state on new player
	try {
		await Player.playSong(config, songDispatch, song.queue, song.index)
		await Player.restoreState(savedState)
	} catch (error) {
		logger.error('RemoteProvider', 'Error restoring state on new player:', error)
		await Player.switchPlayer('local')
		await Player.playSong(config, songDispatch, song.queue, song.index)
		await Player.restoreState(savedState)
		throw error
	}
}

const transferSameType = async (fromDevice, toDevice, config, song, songDispatch) => {
	// Save state from previous player
	const savedState = await Player.saveState()
	await Player.disconnect(fromDevice)
		.catch((error) => logger.error('RemoteProvider', 'Error disconnecting from previous player:', error))

	// Connect to new player
	await Player.connect(toDevice, toDevice?.type || 'local')
	await Player.switchPlayer(toDevice?.type || 'local')

	// Restore state on new player
	await Player.playSong(config, songDispatch, song.queue, song.index)
	await Player.restoreState(savedState)
}

const STATUS = {
	Transferring: 'transferring',
	Connected: 'connected'
}

export const RemoteProvider = ({ children }) => {
	const [selectedDevice, setSelectedDevice] = React.useState(null)
	const [status, setStatus] = React.useState(STATUS.Connected)
	const config = useConfig()
	const song = useSong()
	const songDispatch = useSongDispatch()
	const prevSelectedDeviceRef = React.useRef(null)

	React.useEffect(() => {
		logger.info('RemoteProvider', `Change device from '${prevSelectedDeviceRef.current?.name || 'local'}' to '${selectedDevice?.name || 'local'}'`)
		const prevDevice = prevSelectedDeviceRef.current
		const currentDevice = selectedDevice

		prevSelectedDeviceRef.current = currentDevice
		if (prevDevice?.id === currentDevice?.id) return

		const hasSong = song?.queue && song?.index !== undefined && song?.songInfo
		if (hasSong || config?.url) {
			setStatus(STATUS.Transferring)
			if (prevDevice?.type === currentDevice?.type) {
				transferSameType(prevDevice, currentDevice, config, song, songDispatch)
					.then(() => setStatus(STATUS.Connected))
					.catch((error) => {
						logger.error('RemoteProvider', 'Error transferring playback (same type):', error)
						prevSelectedDeviceRef.current = null
						setStatus(STATUS.Connected)
						Player.switchPlayer('local')
						Player.playSong(config, songDispatch, song.queue, song.index)
						setSelectedDevice(null)
					})
			} else {
				transfer(prevDevice, currentDevice, config, song, songDispatch)
					.then(() => setStatus(STATUS.Connected))
					.catch(() => {
						prevSelectedDeviceRef.current = null
						setStatus(STATUS.Connected)
						setSelectedDevice(null)
					})
			}
		}
	}, [selectedDevice])

	const value = React.useMemo(() => ({
		status,
		type: selectedDevice?.type || 'local',
		selectedDevice,
		selectDevice: (device) => {
			if (status === STATUS.Transferring) return false
			if (selectedDevice?.id === device?.id) return false
			setSelectedDevice(device)
			return true
		},
		reset: () => {
			setSelectedDevice(null)
		}
	}), [selectedDevice, status])

	return (
		<RemoteContext.Provider value={value}>
			{children}
		</RemoteContext.Provider>
	)
}