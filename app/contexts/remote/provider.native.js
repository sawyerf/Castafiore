import React from 'react'

import { RemoteContext } from '~/contexts/remote/context'
import { useConfig } from '~/contexts/config'
import { useSong, useSongDispatch } from '~/contexts/song'
import { useSettings } from '~/contexts/settings'
import logger from '~/utils/logger'
import Player from '~/utils/player'
import State from '~/utils/playerState'
import HeadlessResumePanel from '~/components/popup/HeadlessResumePanel'
import { HEADLESS_DEVICE, fetchStatus, isMpdActive } from '~/utils/remote/headlessApi'

// UPnP / Chromecast transfer helpers — untouched
const transfer = async (fromDevice, toDevice, config, song, songDispatch) => {
	await Player.connect(toDevice, toDevice?.type || 'local')
		.catch((error) => {
			logger.error('RemoteProvider', 'Error connecting to new player:', error)
			throw error
		})

	const savedState = await Player.saveState()
	await Player.stopSong()
		.catch((error) => logger.error('RemoteProvider', 'Error stopping previous player:', error))
	await Player.disconnect(fromDevice)
		.catch((error) => logger.error('RemoteProvider', 'Error disconnecting from previous player:', error))

	await Player.switchPlayer(toDevice?.type || 'local')

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
	const savedState = await Player.saveState()
	await Player.disconnect(fromDevice)
		.catch((error) => logger.error('RemoteProvider', 'Error disconnecting from previous player:', error))

	await Player.connect(toDevice, toDevice?.type || 'local')
	await Player.switchPlayer(toDevice?.type || 'local')

	await Player.playSong(config, songDispatch, song.queue, song.index)
	await Player.restoreState(savedState)
}

const STATUS = { Transferring: 'transferring', Connected: 'connected' }

const hasSong = (song) => !!(song?.queue && song?.index !== undefined && song?.songInfo)

export const RemoteProvider = ({ children }) => {
	const [selectedDevice, setSelectedDevice] = React.useState(null)
	const [transferStatus, setTransferStatus] = React.useState(STATUS.Connected)
	const config = useConfig()
	const song = useSong()
	const songDispatch = useSongDispatch()
	const settings = useSettings()
	const prevDeviceRef = React.useRef(null)
	const bootCheckedRef = React.useRef(false)
	
	// null = closed, 'boot' | 'manual' = open with context
	const [modal, setModal] = React.useState(null)
	// { resume: fn, send: fn | null } — populated before showing modal
	const pendingRef = React.useRef(null)

	// Boot check — fires once when headlessUrl is loaded from AsyncStorage
	React.useEffect(() => {
		const headlessUrl = settings.headlessUrl
		if (!headlessUrl || bootCheckedRef.current) return
		bootCheckedRef.current = true

		fetchStatus()
			.then(mpdStatus => {
				if (isMpdActive(mpdStatus)) {
					pendingRef.current = {
						resume: () => {
							Player.switchPlayer('headless')
							prevDeviceRef.current = HEADLESS_DEVICE
							setSelectedDevice(HEADLESS_DEVICE)
							songDispatch({ type: 'setState', state: State.Playing })
						},
						send: null,
					}
					setModal('boot')
				}
			})
			.catch(() => { })
	}, [settings.headlessUrl])

	const closeModal = (action) => {
		setModal(null)
		action?.()
		pendingRef.current = null
	}

	// Device change effect — handles UPnP/Chromecast and headless→local.
	// local→headless is handled entirely in selectDevice to avoid async race conditions.
	React.useEffect(() => {
		const prevDevice = prevDeviceRef.current
		const currentDevice = selectedDevice

		prevDeviceRef.current = currentDevice

		if (prevDevice?.id === currentDevice?.id) return

		logger.info('RemoteProvider', `device transition: '${prevDevice?.name || 'local'}' → '${currentDevice?.name || 'local'}'`)

		// headless → local: stop+clear MPD, restore local queue at saved position
		if (prevDevice?.type === 'headless' && currentDevice?.type !== 'headless') {
			setTransferStatus(STATUS.Transferring)
			Player.saveState()
				.then(async (savedState) => {
					await Player.disconnect(HEADLESS_DEVICE)
					await Player.switchPlayer('local')
					await Player.connect(null, 'local')
					if (hasSong(song)) {
						await Player.playSong(config, songDispatch, song.queue, song.index, savedState?.isPlaying)
						if (savedState?.isPlaying) await Player.restoreState(savedState)
						songDispatch({ type: 'setState', state: savedState?.isPlaying ? State.Playing : State.Paused })
					} else {
						songDispatch({ type: 'reset' })
					}
					setTransferStatus(STATUS.Connected)
				})
				.catch((error) => {
					logger.error('RemoteProvider', 'Error switching from headless to local:', error)
					setTransferStatus(STATUS.Connected)
				})
			return
		}

		// local→headless is handled in selectDevice — skip
		if (currentDevice?.type === 'headless') return

		// UPnP / Chromecast
		if (hasSong(song) || config?.url) {
			setTransferStatus(STATUS.Transferring)
			const fn = prevDevice?.type === currentDevice?.type ? transferSameType : transfer
			fn(prevDevice, currentDevice, config, song, songDispatch)
				.then(() => setTransferStatus(STATUS.Connected))
				.catch((error) => {
					logger.error('RemoteProvider', 'Error transferring playback:', error)
					setTransferStatus(STATUS.Connected)
					Player.switchPlayer('local')
					Player.playSong(config, songDispatch, song.queue, song.index)
					setSelectedDevice(null)
				})
		}
	}, [selectedDevice])

	const value = React.useMemo(() => ({
		status: transferStatus,
		type: selectedDevice?.type || 'local',
		selectedDevice,
		selectDevice: (device) => {
			if (transferStatus === STATUS.Transferring) return false
			if (selectedDevice?.id === device?.id) return false

			// headless — full async handling here, never goes through useEffect
			if (device?.type === 'headless') {
				const switchDirectly = async () => {
					await Player.stopSong()
					await Player.switchPlayer('headless')
					prevDeviceRef.current = HEADLESS_DEVICE
					setSelectedDevice(HEADLESS_DEVICE)
				}

				const sendToHeadless = async () => {
					setTransferStatus(STATUS.Transferring)
					const savedState = await Player.saveState()
					await Player.stopSong()
					await Player.switchPlayer('headless')
					if (hasSong(song)) {
						await Player.loadSong(config, song.queue, song.index)
						if (savedState?.position > 0) await Player.setPosition(savedState.position)
						if (savedState?.isPlaying) await Player.resumeSong()
					}
					prevDeviceRef.current = HEADLESS_DEVICE
					setSelectedDevice(HEADLESS_DEVICE)
					setTransferStatus(STATUS.Connected)
				}

				const onError = (label) => (e) => logger.error('RemoteProvider', `${label}:`, e)

				fetchStatus()
					.then(mpdStatus => {
						const mpdActive = isMpdActive(mpdStatus)
						if (mpdActive && hasSong(song)) {
							pendingRef.current = {
								resume: () => switchDirectly().catch(onError('onResume')),
								send: () => sendToHeadless().catch(onError('onSend')),
							}
							setModal('manual')
						} else {
							sendToHeadless().catch(onError('switchToHeadless'))
						}
					})
					.catch(() => switchDirectly().catch(onError('switchToHeadless unreachable')))
				return true
			}

			// local / UPnP / Chromecast — goes through useEffect
			setSelectedDevice(device)
			return true
		},
		reset: () => setSelectedDevice(null),
	}), [selectedDevice, transferStatus, song, config, settings.headlessUrl])

	return (
		<RemoteContext.Provider value={value}>
			{children}
			<HeadlessResumePanel
				visible={modal !== null}
				context={modal}
				onResume={() => closeModal(pendingRef.current?.resume)}
				onSend={() => closeModal(pendingRef.current?.send)}
				onCancel={() => closeModal(null)}
			/>
		</RemoteContext.Provider>
	)
}
