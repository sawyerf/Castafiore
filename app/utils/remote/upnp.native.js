/**
 * UPNP/DLNA Discovery and Control Module
 *
 * This module provides functionality to discover and control UPNP/DLNA devices
 * on the local network for audio streaming.
 *
 * Note: This is a native-only module. UPNP/DLNA is not available in web browsers.
 */

import logger from '~/utils/logger'
import { XMLParser } from 'fast-xml-parser'
import UpnpEvent, { Events } from '~/utils/remote/upnpEvents'
import State from '~/utils/playerState'

const parser = new XMLParser({
	removeNSPrefix: true,
})

/**
 * Send SOAP request to device
 * @param {Object} device - Target device
 * @param {string} action - SOAP action
 * @param {Object} params - Action parameters
 * @param {string} serviceType - Service type (default: AVTransport)
 * @returns {Promise<Object>} Response
 */
const sendSoapRequest = async (device, action, params = {}, serviceType = 'AVTransport') => {
	// Fallback URLs if device doesn't specify controlUrl
	const defaultServiceUrls = {
		AVTransport: '/AVTransport/control',
		RenderingControl: '/RenderingControl/control',
	}

	// Use device's controlUrl if available, otherwise use default
	const controlUrl = device.controlUrl || defaultServiceUrls[serviceType]

	const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"
            s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
	<s:Body>
		<u:${action} xmlns:u="urn:schemas-upnp-org:service:${serviceType}:1">
			${Object.entries(params).map(([key, value]) => `<${key}>${escapeXml(value)}</${key}>`).join('\n\t\t\t')}
		</u:${action}>
	</s:Body>
</s:Envelope>`

	try {
		const url = `${device.serviceUrl}${controlUrl}`

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'text/xml; charset="utf-8"',
				'SOAPAction': `"urn:schemas-upnp-org:service:${serviceType}:1#${action}"`,
			},
			body: soapEnvelope,
		})

		const text = await response.text()
		return { success: response.ok, data: parser.parse(text) }
	} catch (error) {
		logger.error('UPNP', `${action} error:`, error)
		return { success: false, error }
	}
}

let intervalState = null
let intervalPosition = null
let events = []

const addPositionInterval = (device) => {
	if (intervalPosition) return

	intervalPosition = setInterval(async () => {
		const progress = await getPosition(device)

		UpnpEvent.emit(Events.PROGRESS_CHANGED, { device, position: progress.position, duration: progress.duration })
	}, 1000)
}

const connect = (device) => {
	events.push(UpnpEvent.addListener(Events.TRACK_ADDED, (payload) => {
		if (intervalState) return
		if (payload.device.id === device.id) {
			let prevState = null

			intervalState = setInterval(async () => {
				const state = await getState(device)
				if (state === prevState) return

				UpnpEvent.emit(Events.STATE_CHANGED, { device, state })
				prevState = state
				if (state === State.Stopped) {
					const progress = await getPosition(device)
					if (progress.duration !== 0 && progress.position >= progress.duration - 1) { // -1 because some devices report position slightly less than duration
						UpnpEvent.emit(Events.TRACK_ENDED, { device })
						clearInterval(intervalState)
						intervalState = null
					}
				}
			}, 1000)
		}
	}))

	if (UpnpEvent.listenerCount(Events.PROGRESS_CHANGED) > 0) {
		addPositionInterval(device)
	}

	events.push(UpnpEvent.addListener('newListener', (event) => {
		if (event === Events.PROGRESS_CHANGED) {
			addPositionInterval(device)
		}
	}))

	events.push(UpnpEvent.addListener('removeListener', (event) => {
		if (event === Events.PROGRESS_CHANGED) {
			if (UpnpEvent.listenerCount(Events.PROGRESS_CHANGED) === 0) {
				clearInterval(intervalPosition)
				intervalPosition = null
			}
		}
	}))
}

const disconnect = (_device) => {
	events.forEach(unsub => unsub())
	clearInterval(intervalState)
	clearInterval(intervalPosition)

	events = []
	intervalPosition = null
	intervalState = null
}

/**
 * Play audio on the UPNP device
 * @param {Object} device - Target device
 * @param {string} url - Audio stream URL
 * @param {Object} metadata - Track metadata (title, artist, album, etc.)
 * @returns {Promise<boolean>} Success status
 */
const load = async (device, url, metadata = {}) => {
	// Step 1: Set the URI
	const didl = createDIDL(metadata, url)
	const setUriResult = await sendSoapRequest(device, 'SetAVTransportURI', {
		InstanceID: '0',
		CurrentURI: url,
		CurrentURIMetaData: didl,
	})

	if (!setUriResult.success) {
		logger.error('UPNP', 'Failed to set URI')
		return false
	}
	UpnpEvent.emit(Events.TRACK_ADDED, { device, track: { url, metadata } })
	return true
}

/**
 * Pause playback on the device
 * @param {Object} device - Target device
 * @returns {Promise<boolean>} Success status
 */
const pause = async (device) => {
	const result = await sendSoapRequest(device, 'Pause', {
		InstanceID: '0',
	})
	if (result.success) UpnpEvent.emit(Events.STATE_CHANGED, { device, state: State.Paused })
	return result.success
}

/**
 * Resume playback on the device (without reloading the URI)
 * @param {Object} device - Target device
 * @returns {Promise<boolean>} Success status
 */
const resume = async (device) => {
	const result = await sendSoapRequest(device, 'Play', {
		InstanceID: '0',
		Speed: '1',
	})
	if (result.success) UpnpEvent.emit(Events.STATE_CHANGED, { device, state: State.Playing })
	return result.success
}

/**
 * Stop playback on the device
 * @param {Object} device - Target device
 * @returns {Promise<boolean>} Success status
 */
const stop = async (device) => {
	const result = await sendSoapRequest(device, 'Stop', {
		InstanceID: '0',
	})
	return result.success
}

/**
 * Seek to a position in the current track
 * @param {Object} device - Target device
 * @param {number} position - Position in seconds
 * @returns {Promise<boolean>} Success status
 */
const seek = async (device, position) => {
	const result = await sendSoapRequest(device, 'Seek', {
		InstanceID: '0',
		Unit: 'REL_TIME',
		Target: formatTime(position),
	})
	return result.success
}

/**
 * Set volume on the device
 * @param {Object} device - Target device
 * @param {number} volume - Volume level (0-100)
 * @returns {Promise<boolean>} Success status
 */
const setVolume = async (device, volume) => {
	const result = await sendSoapRequest(device, 'SetVolume', {
		InstanceID: '0',
		Channel: 'Master',
		DesiredVolume: Math.round(volume).toString(),
	}, 'RenderingControl')

	return result.success
}

const STATE_VALUES = {
	PLAYING: State.Playing,
	PAUSED_PLAYBACK: State.Paused,
	STOPPED: State.Stopped,
	TRANSITIONING: State.Loading,
	NO_MEDIA_PRESENT: State.Stopped,
}

const convertState = (upnpState) => {
	return STATE_VALUES[upnpState] || State.Stopped
}

/**
 * Get current playback status from device
 * @param {Object} device - Target device
 * @returns {Promise<Object>} Playback status
 */
const getState = async (device) => {
	// Get transport state (playing/paused/stopped)
	const transportResult = await sendSoapRequest(device, 'GetTransportInfo', {
		InstanceID: '0',
	})

	return convertState(transportResult.data?.Envelope?.Body?.GetTransportInfoResponse?.CurrentTransportState)
}

const getPosition = async (device) => {
	// Get position info (current position and duration)
	const positionResult = await sendSoapRequest(device, 'GetPositionInfo', {
		InstanceID: '0',
	})

	// Parse position info from XML response
	let position = 0
	let duration = 0

	if (positionResult.data) {
		// Extract RelTime (current position) - format is HH:MM:SS
		const relTimeMatch = positionResult?.data?.Envelope?.Body?.GetPositionInfoResponse?.RelTime
		if (relTimeMatch !== 'NOT_IMPLEMENTED') {
			position = parseTimeToSeconds(relTimeMatch)
		}

		// Extract TrackDuration - format is HH:MM:SS
		const durationMatch = positionResult?.data?.Envelope?.Body?.GetPositionInfoResponse?.TrackDuration
		if (durationMatch !== 'NOT_IMPLEMENTED') {
			duration = parseTimeToSeconds(durationMatch)
		}
	}

	return {
		position,
		duration,
	}
}

/**
 * Parse time string (HH:MM:SS) to seconds
 * @param {string} timeStr - Time string in HH:MM:SS format
 * @returns {number} Time in seconds
 */
const parseTimeToSeconds = (timeStr) => {
	if (!timeStr || timeStr === 'NOT_IMPLEMENTED') return 0

	const parts = timeStr.split(':')
	if (parts.length !== 3) return 0

	const hours = parseInt(parts[0], 10) || 0
	const minutes = parseInt(parts[1], 10) || 0
	const seconds = parseInt(parts[2], 10) || 0

	return hours * 3600 + minutes * 60 + seconds
}

/**
 * Create DIDL-Lite metadata XML for a track
 * @param {Object} metadata - Track metadata
 * @param {string} streamUrl - Stream URL
 * @returns {string} DIDL-Lite XML string
 */
const createDIDL = (metadata, streamUrl) => {
	const { title = 'Unknown', artist = 'Unknown', album = 'Unknown', coverUrl = '' } = metadata

	return escapeXml(`<DIDL-Lite xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/">
	<item id="1" parentID="0" restricted="1">
		<dc:title>${title}</dc:title>
		<upnp:artist>${artist}</upnp:artist>
		<upnp:album>${album}</upnp:album>
		${coverUrl ? `<upnp:albumArtURI>${coverUrl}</upnp:albumArtURI>` : ''}
		<upnp:class>object.item.audioItem.musicTrack</upnp:class>
		<res protocolInfo="http-get:*:audio/mpeg:*">${streamUrl}</res>
	</item>
</DIDL-Lite>`)
}

/**
 * Escape XML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
const escapeXml = (str) => {
	if (typeof str !== 'string') return ''
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}

/**
 * Format seconds to HH:MM:SS format
 * @param {number} seconds
 * @returns {string} Formatted time string
 */
const formatTime = (seconds) => {
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = Math.floor(seconds % 60)
	return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default {
	connect,
	disconnect,
	load,
	pause,
	resume,
	stop,
	seek,
	setVolume,
	getState,
	getPosition,
}