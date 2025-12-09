/**
 * UPNP/DLNA Discovery and Control Module
 *
 * This module provides functionality to discover and control UPNP/DLNA devices
 * on the local network for audio streaming.
 *
 * Note: This is a native-only module. UPNP/DLNA is not available in web browsers.
 */

import logger from '~/utils/logger'
import { discoverViaSsdp } from '~/utils/remote/upnpSsdp'

/**
 * Discover UPNP/DLNA devices on the network using SSDP and HTTP in parallel
 * @param {Function} onDeviceFound - Optional callback called when each device is found
 * @returns {Promise<Array>} Array of discovered devices
 */
export const discoverDevices = async (onDeviceFound = null) => {
	logger.info('UPNP', 'Starting device discovery (SSDP + HTTP in parallel)...')

	const foundDeviceIds = new Set() // Track devices already reported

	try {
		// Create callback wrapper that deduplicates and calls user callback
		const deviceCallback = (device) => {
			if (device && device.id && !foundDeviceIds.has(device.id)) {
				foundDeviceIds.add(device.id)
				if (onDeviceFound) {
					onDeviceFound(device)
				}
			}
		}

		// Scan SSDP
		const [ssdpDevices, httpDevices] = await discoverViaSsdp(5000, deviceCallback)

		// Collect successful results
		const ssdp = ssdpDevices?.status === 'fulfilled' ? ssdpDevices.value : []
		const http = httpDevices?.status === 'fulfilled' ? httpDevices.value : []

		logger.info('UPNP', `SSDP found ${ssdp.length} devices, HTTP found ${http.length} devices`)

		// Combine and deduplicate devices (by id)
		const allDevices = [...ssdp, ...http]
		const uniqueDevices = Array.from(
			new Map(allDevices.map(d => [d.id, d])).values()
		)

		logger.info('UPNP', `Discovery completed, found ${uniqueDevices.length} unique devices`)
		return uniqueDevices
	} catch (error) {
		logger.error('UPNP', 'Discovery error:', error)
		return []
	}
}

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
		logger.debug('UPNP', `Sending ${action} to ${url}`)

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'text/xml; charset="utf-8"',
				'SOAPAction': `"urn:schemas-upnp-org:service:${serviceType}:1#${action}"`,
			},
			body: soapEnvelope,
		})

		const text = await response.text()
		return { success: response.ok, data: text }
	} catch (error) {
		logger.error('UPNP', `${action} error:`, error)
		return { success: false, error }
	}
}

/**
 * Play audio on the UPNP device
 * @param {Object} device - Target device
 * @param {string} url - Audio stream URL
 * @param {Object} metadata - Track metadata (title, artist, album, etc.)
 * @returns {Promise<boolean>} Success status
 */
export const playOnDevice = async (device, url, metadata = {}) => {
	logger.info('UPNP', `Playing on device: ${device.name}`, { url })

	try {
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

		// Step 2: Send Play command
		const playResult = await sendSoapRequest(device, 'Play', {
			InstanceID: '0',
			Speed: '1',
		})

		return playResult.success
	} catch (error) {
		logger.error('UPNP', 'Play error:', error)
		return false
	}
}

/**
 * Pause playback on the device
 * @param {Object} device - Target device
 * @returns {Promise<boolean>} Success status
 */
export const pauseOnDevice = async (device) => {
	try {
		const result = await sendSoapRequest(device, 'Pause', {
			InstanceID: '0',
		})
		return result.success
	} catch (error) {
		logger.error('UPNP', 'Pause error:', error)
		return false
	}
}

/**
 * Resume playback on the device (without reloading the URI)
 * @param {Object} device - Target device
 * @returns {Promise<boolean>} Success status
 */
export const resumeOnDevice = async (device) => {
	try {
		const result = await sendSoapRequest(device, 'Play', {
			InstanceID: '0',
			Speed: '1',
		})
		return result.success
	} catch (error) {
		logger.error('UPNP', 'Resume error:', error)
		return false
	}
}

/**
 * Stop playback on the device
 * @param {Object} device - Target device
 * @returns {Promise<boolean>} Success status
 */
export const stopOnDevice = async (device) => {
	try {
		const result = await sendSoapRequest(device, 'Stop', {
			InstanceID: '0',
		})
		return result.success
	} catch (error) {
		logger.error('UPNP', 'Stop error:', error)
		return false
	}
}

/**
 * Seek to a position in the current track
 * @param {Object} device - Target device
 * @param {number} position - Position in seconds
 * @returns {Promise<boolean>} Success status
 */
export const seekOnDevice = async (device, position) => {
	try {
		const result = await sendSoapRequest(device, 'Seek', {
			InstanceID: '0',
			Unit: 'REL_TIME',
			Target: formatTime(position),
		})
		return result.success
	} catch (error) {
		logger.error('UPNP', 'Seek error:', error)
		return false
	}
}

/**
 * Set volume on the device
 * @param {Object} device - Target device
 * @param {number} volume - Volume level (0-100)
 * @returns {Promise<boolean>} Success status
 */
export const setVolumeOnDevice = async (device, volume) => {
	try {
		const result = await sendSoapRequest(device, 'SetVolume', {
			InstanceID: '0',
			Channel: 'Master',
			DesiredVolume: Math.round(volume).toString(),
		}, 'RenderingControl')

		return result.success
	} catch (error) {
		logger.error('UPNP', 'Set volume error:', error)
		return false
	}
}

/**
 * Get current playback status from device
 * @param {Object} device - Target device
 * @returns {Promise<Object>} Playback status
 */
export const getDeviceStatus = async (device) => {
	try {
		// Get transport state (playing/paused/stopped)
		const transportResult = await sendSoapRequest(device, 'GetTransportInfo', {
			InstanceID: '0',
		})

		// Parse XML response to extract state
		const state = transportResult.data?.includes('PLAYING') ? 'playing' :
		             transportResult.data?.includes('PAUSED_PLAYBACK') ? 'paused' :
		             'stopped'

		// Get position info (current position and duration)
		const positionResult = await sendSoapRequest(device, 'GetPositionInfo', {
			InstanceID: '0',
		})

		// Parse position info from XML response
		let position = 0
		let duration = 0

		if (positionResult.data) {
			// Extract RelTime (current position) - format is HH:MM:SS
			const relTimeMatch = positionResult.data.match(/<RelTime>([^<]+)<\/RelTime>/)
			if (relTimeMatch && relTimeMatch[1] !== 'NOT_IMPLEMENTED') {
				position = parseTimeToSeconds(relTimeMatch[1])
			}

			// Extract TrackDuration - format is HH:MM:SS
			const durationMatch = positionResult.data.match(/<TrackDuration>([^<]+)<\/TrackDuration>/)
			if (durationMatch && durationMatch[1] !== 'NOT_IMPLEMENTED') {
				duration = parseTimeToSeconds(durationMatch[1])
			}
		}

		return {
			state,
			position,
			duration,
			volume: 50, // Volume requires RenderingControl service
		}
	} catch (error) {
		logger.error('UPNP', 'Get status error:', error)
		return null
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
	discoverDevices,
	playOnDevice,
	pauseOnDevice,
	resumeOnDevice,
	stopOnDevice,
	seekOnDevice,
	setVolumeOnDevice,
	getDeviceStatus,
}
