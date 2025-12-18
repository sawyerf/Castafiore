/**
 * SSDP Discovery using UDP Multicast (Standard UPNP Method)
 *
 * Sends M-SEARCH multicast to 239.255.255.250:1900 and listens for device responses.
 * Requires: react-native-udp package and CHANGE_WIFI_MULTICAST_STATE permission (Android)
 */

import logger from '~/utils/logger'
import dgram from 'react-native-udp'
import { XMLParser } from 'fast-xml-parser'

const SSDP_ADDRESS = '239.255.255.250'
const SSDP_PORT = 1900

const parser = new XMLParser({
	removeNSPrefix: true,
})

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

const fetchDeviceDescription = async (deviceInfo) => {
	try {
		const response = await fetch(deviceInfo.location)
		if (!response.ok) return null

		let xml = null
		try {
			xml = parser.parse(await response.text())
		} catch (error) {
			logger.error('UPNP-SSDP', 'XML Parse error:', error)
		}

		return {
			id: xml?.root?.device?.UDN || `uuid:${deviceInfo.ip}:${deviceInfo.port}`,
			name: xml?.root?.device?.friendlyName || `Device at ${deviceInfo.ip}`,
			host: deviceInfo.ip,
			port: deviceInfo.port,
			manufacturer: xml?.root?.device?.manufacturer || 'Unknown',
			serviceUrl: `http://${deviceInfo.ip}:${deviceInfo.port}`,
			controlUrl: xml?.root?.device?.serviceList?.service?.find(s => s.serviceType === 'urn:schemas-upnp-org:service:AVTransport:1')?.controlURL || '/upnp/control/rendertransport1',
			isMediaRenderer: true,
			type: 'upnp',
		}
	} catch (error) {
		logger.error('UPNP-SSDP', 'Fetch error:', error)
		return null
	}
}

const discoverViaSsdp = (timeout = 5000, onDeviceFound = null) => {
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

/**
 * Discover UPNP/DLNA devices on the network using SSDP and HTTP in parallel
 * @param {Function} onDeviceFound - Optional callback called when each device is found
 * @returns {Promise<Array>} Array of discovered devices
 */
export const discoverDevices = async (onDeviceFound = null) => {
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



		// Combine and deduplicate devices (by id)
		const allDevices = [...ssdp, ...http]
		const uniqueDevices = Array.from(
			new Map(allDevices.map(d => [d.id, d])).values()
		)


		return uniqueDevices
	} catch (error) {
		logger.error('UPNP', 'Discovery error:', error)
		return []
	}
}