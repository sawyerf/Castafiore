import React from 'react'
import { SongContext, SongDispatchContext } from '~/contexts/song'
import { ConfigContext } from '~/contexts/config'

import Player from '~/utils/player'
import LocalPlayer from '~/utils/player/playerLocal'
import UpnpPlayer from '~/utils/player/playerUpnp'
import CastPlayer from '~/utils/player/playerCast'

const RemoteContext = React.createContext()

const getPlayer = (type) => {
	if (type === 'chromecast') return CastPlayer
	else if (type === 'upnp') return UpnpPlayer
	return LocalPlayer
}

export const RemoteProvider = ({ children }) => {
	const [selectedDevice, setSelectedDevice] = React.useState(null)
	const config = React.useContext(ConfigContext)
	const song = React.useContext(SongContext)
	const songDispatch = React.useContext(SongDispatchContext)
	const prevSelectedDeviceRef = React.useRef(null)

	React.useEffect(() => {
		Player.initPlayerRouter(
			{
				type: selectedDevice?.type || 'local',
				selectedDevice,
			}
		)
	}, [selectedDevice])


	React.useEffect(() => {
		const prevDevice = prevSelectedDeviceRef.current
		const currentDevice = selectedDevice

		prevSelectedDeviceRef.current = currentDevice
		if (prevDevice?.id === currentDevice?.id) return

		const hasSong = song?.queue && song?.index !== undefined && song?.songInfo
		if (hasSong || config?.url) {
			(async () => {
				const previousPlayer = getPlayer(prevDevice?.type)
				let savedState = null

				if (previousPlayer) {
					savedState = await previousPlayer.saveState()
					await previousPlayer.stopSong()
					await previousPlayer.disconnect(prevDevice)
				}

				await Player.connect(currentDevice)
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
