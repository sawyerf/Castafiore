/**
 * SSDP Discovery using UDP Multicast (Standard UPNP Method)
 *
 * Sends M-SEARCH multicast to 239.255.255.250:1900 and listens for device responses.
 * Requires: react-native-udp package and CHANGE_WIFI_MULTICAST_STATE permission (Android)
 */

import logger from '~/utils/logger'

// Try to import dgram
let dgram = null
dgram = require('react-native-udp')

const SSDP_ADDRESS = '239.255.255.250'
const SSDP_PORT = 1900

/**
 * Create M-SEARCH packet for discovering MediaRenderer devices
 */
const createMSearchPacket = () => {
	return (
		'M-SEARCH * HTTP/1.1\r\n' +
		`HOST: ${SSDP_ADDRESS}:${SSDP_PORT}\r\n` +
		'MAN: "ssdp:discover"\r\n' +
		'MX: 3\r\n' +
		'ST: urn:schemas-upnp-org:device:MediaRenderer:1\r\n' +
		'\r\n'
	)
}

/**
 * Parse SSDP response to extract device location
 */
const parseSsdpResponse = (response) => {
	try {
		const responseStr = response.toString()
		const locationMatch = responseStr.match(/LOCATION:\s*(.+)/i)
		if (!locationMatch) return null

		const location = locationMatch[1].trim()
		const urlMatch = location.match(/http:\/\/([^:]+):(\d+)/)
		if (!urlMatch) return null

		return {
			ip: urlMatch[1],
			port: parseInt(urlMatch[2], 10),
			location,
		}
	} catch (error) {
		logger.error('UPNP-SSDP', 'Parse error:', error)
		return null
	}
}

/**
 * Fetch and parse device description XML
 */
const fetchDeviceDescription = async (deviceInfo) => {
	try {
		const response = await fetch(deviceInfo.location)
		if (!response.ok) return null

		const xml = await response.text()
		const friendlyNameMatch = xml.match(/<friendlyName>([^<]+)<\/friendlyName>/)
		const manufacturerMatch = xml.match(/<manufacturer>([^<]+)<\/manufacturer>/)
		const udnMatch = xml.match(/<UDN>([^<]+)<\/UDN>/)
		const controlUrlMatch = xml.match(/<serviceType>urn:schemas-upnp-org:service:AVTransport:1<\/serviceType>[\s\S]*?<controlURL>([^<]+)<\/controlURL>/)

		return {
			id: udnMatch ? udnMatch[1] : `uuid:${deviceInfo.ip}:${deviceInfo.port}`,
			name: friendlyNameMatch ? friendlyNameMatch[1] : `Device at ${deviceInfo.ip}`,
			host: deviceInfo.ip,
			port: deviceInfo.port,
			manufacturer: manufacturerMatch ? manufacturerMatch[1] : 'Unknown',
			serviceUrl: `http://${deviceInfo.ip}:${deviceInfo.port}`,
			controlUrl: controlUrlMatch ? controlUrlMatch[1] : '/upnp/control/rendertransport1',
			isMediaRenderer: true,
		}
	} catch (error) {
		logger.error('UPNP-SSDP', 'Fetch error:', error)
		return null
	}
}

/**
 * Discover UPNP MediaRenderer devices using SSDP M-SEARCH
 */
export const discoverViaSsdp = (timeout = 5000, onDeviceFound = null) => {
	return new Promise((resolve, reject) => {
		if (!dgram?.createSocket) {
			reject(new Error('react-native-udp not available'))
			return
		}

		const devices = new Map()
		const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true })

		socket.on('message', async (msg) => {
			const deviceInfo = parseSsdpResponse(msg)
			if (!deviceInfo || devices.has(deviceInfo.location)) return

			const device = await fetchDeviceDescription(deviceInfo)
			if (device) {
				devices.set(deviceInfo.location, device)
				onDeviceFound?.(device)
			}
		})

		socket.on('error', (err) => {
			logger.error('UPNP-SSDP', 'Socket error:', err)
			socket.close()
			reject(err)
		})

		socket.on('listening', () => {
			const packet = createMSearchPacket()
			socket.send(packet, 0, packet.length, SSDP_PORT, SSDP_ADDRESS, (err) => {
				if (err) {
					socket.close()
					reject(err)
				}
			})

			setTimeout(() => {
				socket.close()
				resolve(Array.from(devices.values()))
			}, timeout)
		})

		try {
			socket.bind()
		} catch (error) {
			logger.error('UPNP-SSDP', 'Bind error:', error)
			reject(error)
		}
	})
}

export default { discoverViaSsdp }
