/**
 * UPNP/DLNA Discovery and Control Module
 *
 * This module provides functionality to discover and control UPNP/DLNA devices
 * on the local network for audio streaming.
 *
 * Note: This is a native-only module. UPNP/DLNA is not available in web browsers.
 */

import logger from '~/utils/logger'
import { quickScan, scanNetwork } from '~/utils/upnpHttp.native'
import { discoverViaSsdp } from '~/utils/upnpSsdp.native'

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

		// Run both SSDP and HTTP scans in parallel for faster discovery
		const [ssdpDevices, httpDevices] = await Promise.allSettled([
			discoverViaSsdp(5000, deviceCallback),
			quickScan(deviceCallback)
		])

		// Collect successful results
		const ssdp = ssdpDevices.status === 'fulfilled' ? ssdpDevices.value : []
		const http = httpDevices.status === 'fulfilled' ? httpDevices.value : []

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
 * Connect to a UPNP/DLNA device
 * @param {Object} device - Device object with host and port
 * @returns {Promise<boolean>} Success status
 */
export const connectToDevice = async (device) => {
	logger.info('UPNP', `Connecting to device: ${device.name}`)

	try {
		// Test connection by fetching device description
		const response = await fetch(`${device.serviceUrl}/description.xml`, {
			method: 'GET',
			timeout: 5000,
		})

		if (response.ok) {
			logger.info('UPNP', 'Device connection successful')
			return true
		}

		logger.error('UPNP', 'Device connection failed:', response.status)
		return false
	} catch (error) {
		logger.error('UPNP', 'Connection error:', error)
		return false
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
		logger.debug('UPNP', `${action} response:`, text)

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
	logger.info('UPNP', `Pausing on device: ${device.name}`)

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
 * Stop playback on the device
 * @param {Object} device - Target device
 * @returns {Promise<boolean>} Success status
 */
export const stopOnDevice = async (device) => {
	logger.info('UPNP', `Stopping on device: ${device.name}`)

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
	logger.info('UPNP', `Seeking on device: ${device.name} to ${position}s`)

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
	logger.info('UPNP', `Setting volume on device: ${device.name} to ${volume}`)

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
		const transportResult = await sendSoapRequest(device, 'GetTransportInfo', {
			InstanceID: '0',
		})

		// Parse XML response to extract status
		// This is simplified - a full implementation would use proper XML parsing
		const state = transportResult.data?.includes('PLAYING') ? 'playing' :
		             transportResult.data?.includes('PAUSED_PLAYBACK') ? 'paused' :
		             'stopped'

		// TODO: Implement GetPositionInfo and GetVolume for full status
		return {
			state,
			volume: 50, // Placeholder - need to call GetVolume on RenderingControl
			position: 0, // Placeholder - need to parse GetPositionInfo response
			duration: 0, // Placeholder - need to parse GetPositionInfo response
		}
	} catch (error) {
		logger.error('UPNP', 'Get status error:', error)
		return null
	}
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

/**
 * Full network scan (slower but more thorough)
 * @param {string} ipPrefix - Network prefix (e.g., '192.168.1')
 * @param {number} startIp - Starting IP last octet
 * @param {number} endIp - Ending IP last octet
 * @returns {Promise<Array>} Array of discovered devices
 */
export const fullNetworkScan = async (ipPrefix, startIp = 1, endIp = 254) => {
	logger.info('UPNP', 'Starting full network scan...')
	try {
		const devices = await scanNetwork(ipPrefix, startIp, endIp)
		logger.info('UPNP', `Full scan completed, found ${devices.length} devices`)
		return devices
	} catch (error) {
		logger.error('UPNP', 'Full scan error:', error)
		return []
	}
}

export default {
	discoverDevices,
	fullNetworkScan,
	connectToDevice,
	playOnDevice,
	pauseOnDevice,
	stopOnDevice,
	seekOnDevice,
	setVolumeOnDevice,
	getDeviceStatus,
}
