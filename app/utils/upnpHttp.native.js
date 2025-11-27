/**
 * HTTP-based UPNP/DLNA Discovery (Fallback Method)
 *
 * Scans common IPs and ports on the local network to discover UPNP/DLNA devices.
 * Limitations: Does NOT use true SSDP/UDP multicast, slower than proper SSDP.
 */

import logger from '~/utils/logger'

// Common UPNP/DLNA ports (reduced list)
const COMMON_PORTS = [1400, 49152, 49153, 8080]

/**
 * Get local device IP address to detect network prefix
 */
const getLocalIpPrefix = async () => {
	try {
		const NetInfo = require('@react-native-community/netinfo')
		const state = await NetInfo.fetch()

		// Try to extract IP from details (Android/iOS)
		const ip = state?.details?.ipAddress
		if (ip && typeof ip === 'string') {
			const parts = ip.split('.')
			if (parts.length === 4) {
				return `${parts[0]}.${parts[1]}.${parts[2]}`
			}
		}
	} catch (error) {
		logger.warn('UPNP-HTTP', 'Could not detect local IP:', error)
	}

	// Fallback to most common private ranges
	return null
}

/**
 * Get network prefixes to scan (device network + common ranges)
 */
const getNetworkPrefixes = async () => {
	const prefixes = new Set()

	// Try to detect actual network
	const localPrefix = await getLocalIpPrefix()
	if (localPrefix) {
		prefixes.add(localPrefix)
	}

	// Add common private network ranges as fallback
	prefixes.add('192.168.1')
	prefixes.add('192.168.0')
	prefixes.add('10.0.0')
	prefixes.add('192.168.2')
	prefixes.add('172.16.0')

	return Array.from(prefixes)
}

/**
 * Try to fetch device description from a potential UPNP device
 */
const tryFetchDeviceDescription = async (ip, port, timeout = 1500) => {
	const url = `http://${ip}:${port}/description.xml`

	try {
		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), timeout)

		const response = await fetch(url, {
			method: 'GET',
			signal: controller.signal,
		})

		clearTimeout(timeoutId)

		if (response.ok) {
			const xml = await response.text()
			return { xml, ip, port }
		}
	} catch {
		// Timeout or connection refused
	}

	return null
}

/**
 * Parse device info from XML (simplified parser)
 */
const parseDeviceXml = (xml, ip, port) => {
	try {
		const friendlyNameMatch = xml.match(/<friendlyName>([^<]+)<\/friendlyName>/)
		const manufacturerMatch = xml.match(/<manufacturer>([^<]+)<\/manufacturer>/)
		const deviceTypeMatch = xml.match(/<deviceType>([^<]+)<\/deviceType>/)
		const udnMatch = xml.match(/<UDN>([^<]+)<\/UDN>/)
		const controlUrlMatch = xml.match(/<serviceType>urn:schemas-upnp-org:service:AVTransport:1<\/serviceType>[\s\S]*?<controlURL>([^<]+)<\/controlURL>/)

		const deviceType = deviceTypeMatch ? deviceTypeMatch[1] : ''
		const isMediaRenderer = deviceType.includes('MediaRenderer') || xml.includes('AVTransport')

		return {
			id: udnMatch ? udnMatch[1] : `uuid:${ip}:${port}`,
			name: friendlyNameMatch ? friendlyNameMatch[1] : 'Unknown Device',
			host: ip,
			port: port,
			manufacturer: manufacturerMatch ? manufacturerMatch[1] : 'Unknown',
			serviceUrl: `http://${ip}:${port}`,
			isMediaRenderer: isMediaRenderer,
			controlUrl: controlUrlMatch ? controlUrlMatch[1] : '/upnp/control/rendertransport1',
		}
	} catch (error) {
		logger.error('UPNP-HTTP', 'Parse error:', error)
		return null
	}
}

/**
 * Quick scan of common IPs (optimized for speed)
 * @param {Function} onDeviceFound - Callback called when each device is found
 */
export const quickScan = async (onDeviceFound = null) => {
	// Get network prefixes (device network + common ranges)
	const networkPrefixes = await getNetworkPrefixes()

	// Common router/device IPs (reduced list for speed)
	const commonIps = [1, 2, 3, 4, 5, 10, 20, 50, 100]
	const devices = []
	const deviceIds = new Set()

	const promises = networkPrefixes.flatMap(prefix =>
		commonIps.flatMap(lastOctet =>
			COMMON_PORTS.map(port =>
				tryFetchDeviceDescription(`${prefix}.${lastOctet}`, port)
					.then(result => {
						if (result) {
							const device = parseDeviceXml(result.xml, result.ip, result.port)
							if (device?.isMediaRenderer && !deviceIds.has(device.id)) {
								deviceIds.add(device.id)
								devices.push(device)
								onDeviceFound?.(device)
							}
						}
					})
					.catch(() => {})
			)
		)
	)

	await Promise.all(promises)
	return devices
}

export default { quickScan }
