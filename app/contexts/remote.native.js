import React from 'react'
import { SongContext, SongDispatchContext } from '~/contexts/song'
import { ConfigContext } from '~/contexts/config'

import Player from '~/utils/player'

const RemoteContext = React.createContext()

export const RemoteProvider = ({ children }) => {
	const [selectedDevice, setSelectedDevice] = React.useState(null)
	const config = React.useContext(ConfigContext)
	const song = React.useContext(SongContext)
	const songDispatch = React.useContext(SongDispatchContext)
	const prevSelectedDeviceRef = React.useRef(null)

	React.useEffect(() => {
		const prevDevice = prevSelectedDeviceRef.current
		const currentDevice = selectedDevice

		prevSelectedDeviceRef.current = currentDevice
		if (prevDevice?.id === currentDevice?.id) return

		const hasSong = song?.queue && song?.index !== undefined && song?.songInfo
		if (hasSong || config?.url) {
			(async () => {
				// Action on previous player
				const savedState = await Player.saveState()
				await Player.stopSong()
				await Player.disconnect(prevDevice)

				// Action on current player
				await Player.connect(currentDevice, currentDevice?.type || 'local')
				await Player.playSong(config, songDispatch, song.queue, song.index)
				await Player.restoreState(savedState)
			})()
		}
	}, [selectedDevice])

	const value = React.useMemo(() => ({
		type: selectedDevice?.type || 'local',
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
	const context = React.useContext(RemoteContext)
	if (!context) {
		throw new Error('useRemote must be used within RemoteProvider')
	}
	return context
}
