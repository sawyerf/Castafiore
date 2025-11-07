/**
 * SSDP Discovery using UDP Multicast (Standard UPNP Method)
 *
 * This is the proper and standard way to discover UPNP/DLNA devices.
 * It uses the SSDP (Simple Service Discovery Protocol) specification.
 *
 * How it works:
 * 1. Sends M-SEARCH multicast packet to 239.255.255.250:1900
 * 2. Listens for SSDP responses from devices on the network
 * 3. Parses LOCATION header to get device description URL
 * 4. Fetches and parses device XML description
 *
 * Advantages:
 * - Standard UPNP protocol (defined in UPnP Device Architecture)
 * - Discovers ALL UPNP devices (including gmrender-resurrect)
 * - Fast (parallel UDP responses)
 * - Reliable
 *
 * Requirements:
 * - react-native-udp package
 * - CHANGE_WIFI_MULTICAST_STATE permission (Android)
 *
 * If this fails, upnpHttp.native.js is used as fallback.
 */

import { Buffer } from 'buffer'
import logger from '~/utils/logger'

// Try to import dgram, but handle gracefully if not available
let dgram = null
try {
	dgram = require('react-native-udp')
} catch {
	logger.error('UPNP-SSDP', 'react-native-udp not available, SSDP M-SEARCH will not work')
	logger.error('UPNP-SSDP', 'This is expected in Expo Go. Use a development build for UPNP support.')
}

const SSDP_ADDRESS = '239.255.255.250'
const SSDP_PORT = 1900

/**
 * Create M-SEARCH packet for discovering MediaRenderer devices
 */
const createMSearchPacket = () => {
	return Buffer.from(
		'M-SEARCH * HTTP/1.1\r\n' +
		`HOST: ${SSDP_ADDRESS}:${SSDP_PORT}\r\n` +
		'MAN: "ssdp:discover"\r\n' +
		'MX: 3\r\n' +
		'ST: urn:schemas-upnp-org:device:MediaRenderer:1\r\n' +
		'\r\n'
	)
}

/**
 * Parse SSDP response to extract device info
 */
const parseSsdpResponse = (response, rinfo) => {
	try {
		const responseStr = response.toString()

		// Extract LOCATION header
		const locationMatch = responseStr.match(/LOCATION:\s*(.+)/i)
		if (!locationMatch) {
			logger.error('UPNP-SSDP', 'No LOCATION in SSDP response')
			return null
		}

		const location = locationMatch[1].trim()
		const urlMatch = location.match(/http:\/\/([^:]+):(\d+)(.+)/)

		if (!urlMatch) {
			logger.error('UPNP-SSDP', `Invalid LOCATION format: ${location}`)
			return null
		}

		const [, ip, port, path] = urlMatch

		// Extract other headers
		const serverMatch = responseStr.match(/SERVER:\s*(.+)/i)
		const usnMatch = responseStr.match(/USN:\s*(.+)/i)

		return {
			ip,
			port: parseInt(port, 10),
			location,
			path,
			server: serverMatch ? serverMatch[1].trim() : 'Unknown',
			usn: usnMatch ? usnMatch[1].trim() : '',
			rinfo,
		}
	} catch (error) {
		logger.error('UPNP-SSDP', 'Error parsing SSDP response:', error)
		return null
	}
}

/**
 * Fetch and parse device description XML from discovered device
 */
const fetchDeviceDescription = async (deviceInfo) => {
	try {
		const response = await fetch(deviceInfo.location, {
			method: 'GET',
			headers: {
				'User-Agent': 'Castafiore/1.0 UPnP/1.0',
			},
		})

		if (!response.ok) {
			logger.error('UPNP-SSDP', `HTTP ${response.status} from ${deviceInfo.location}`)
			return null
		}

		const xml = await response.text()

		// Parse device info from XML
		const friendlyNameMatch = xml.match(/<friendlyName>([^<]+)<\/friendlyName>/)
		const manufacturerMatch = xml.match(/<manufacturer>([^<]+)<\/manufacturer>/)
		const modelMatch = xml.match(/<modelName>([^<]+)<\/modelName>/)
		const udnMatch = xml.match(/<UDN>([^<]+)<\/UDN>/)

		// Extract AVTransport control URL
		const controlUrlMatch = xml.match(/<serviceType>urn:schemas-upnp-org:service:AVTransport:1<\/serviceType>[\s\S]*?<controlURL>([^<]+)<\/controlURL>/)

		return {
			id: udnMatch ? udnMatch[1] : `uuid:${deviceInfo.ip}:${deviceInfo.port}`,
			name: friendlyNameMatch ? friendlyNameMatch[1] : `Device at ${deviceInfo.ip}`,
			host: deviceInfo.ip,
			port: deviceInfo.port,
			manufacturer: manufacturerMatch ? manufacturerMatch[1] : 'Unknown',
			model: modelMatch ? modelMatch[1] : 'Unknown',
			serviceUrl: `http://${deviceInfo.ip}:${deviceInfo.port}`,
			controlUrl: controlUrlMatch ? controlUrlMatch[1] : '/upnp/control/rendertransport1',
			type: 'urn:schemas-upnp-org:device:MediaRenderer:1',
			isMediaRenderer: true,
			rawXml: xml,
		}
	} catch (error) {
		logger.error('UPNP-SSDP', `Error fetching description from ${deviceInfo.location}:`, error)
		return null
	}
}

/**
 * Discover UPNP MediaRenderer devices using SSDP M-SEARCH
 */
export const discoverViaSsdp = (timeout = 5000, onDeviceFound = null) => {
	return new Promise((resolve, reject) => {
		// Check if dgram is available
		if (!dgram || !dgram.createSocket) {
			logger.error('UPNP-SSDP', 'UDP not available, cannot perform SSDP discovery')
			reject(new Error('react-native-udp not available. Please use a development build.'))
			return
		}

		const devices = new Map()
		const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true })

		logger.info('UPNP-SSDP', 'Starting SSDP M-SEARCH discovery...')

		socket.on('message', async (msg, rinfo) => {
			logger.info('UPNP-SSDP', `Received SSDP response from ${rinfo.address}:${rinfo.port}`)

			const deviceInfo = parseSsdpResponse(msg, rinfo)
			if (!deviceInfo) {
				return
			}

			const key = deviceInfo.location

			if (!devices.has(key)) {
				logger.info('UPNP-SSDP', `Fetching device description from ${deviceInfo.location}`)

				const device = await fetchDeviceDescription(deviceInfo)
				if (device) {
					devices.set(key, device)
					logger.info('UPNP-SSDP', `✓ Found device: ${device.name} at ${device.host}:${device.port}`)
					// Call callback immediately when device is found
					if (onDeviceFound) {
						onDeviceFound(device)
					}
				}
			}
		})

		socket.on('error', (err) => {
			logger.error('UPNP-SSDP', 'Socket error:', err)
			socket.close()
			reject(err)
		})

		socket.on('listening', () => {
			logger.info('UPNP-SSDP', `Socket listening, sending M-SEARCH to ${SSDP_ADDRESS}:${SSDP_PORT}`)

			const packet = createMSearchPacket()

			socket.send(packet, 0, packet.length, SSDP_PORT, SSDP_ADDRESS, (err) => {
				if (err) {
					logger.error('UPNP-SSDP', 'Error sending M-SEARCH:', err)
					socket.close()
					reject(err)
					return
				}

				logger.info('UPNP-SSDP', `M-SEARCH sent, waiting ${timeout}ms for responses...`)
			})

			// Timeout
			setTimeout(() => {
				socket.close()
				const found = Array.from(devices.values())
				logger.info('UPNP-SSDP', `SSDP discovery complete, found ${found.length} MediaRenderer device(s)`)
				resolve(found)
			}, timeout)
		})

		try {
			socket.bind()
		} catch (error) {
			logger.error('UPNP-SSDP', 'Error binding socket:', error)
			reject(error)
		}
	})
}

export default {
	discoverViaSsdp,
}
