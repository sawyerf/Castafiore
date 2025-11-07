/**
 * HTTP-based UPNP/DLNA Discovery (Fallback Method)
 *
 * This module provides HTTP-based device discovery as a fallback when
 * true SSDP M-SEARCH is unavailable or fails.
 *
 * How it works:
 * 1. Scans common IPs on the local network (192.168.x.x, 10.0.0.x)
 * 2. Tests common UPNP ports (1400, 8080, 49494, etc.)
 * 3. Fetches device description XML via HTTP
 * 4. Parses device information
 *
 * Limitations:
 * - Does NOT use true SSDP/UDP multicast
 * - May not detect all UPNP devices (e.g., gmrender-resurrect)
 * - Slower than SSDP (sequential HTTP requests)
 *
 * Use upnpSsdpReal.native.js for proper SSDP discovery.
 */

import logger from '~/utils/logger'

// Common UPNP/DLNA ports
const COMMON_PORTS = [1400, 8080, 8008, 49152, 49153, 49154, 8200, 49494]

/**
 * Try to detect the local network by testing connectivity
 * This is a fallback when NetInfo is not available
 */
const detectLocalNetwork = async () => {
	const testPrefixes = ['192.168.1', '192.168.0', '10.0.0', '192.168.2']
	logger.info('UPNP-SSDP', 'Attempting to detect local network...')

	for (const prefix of testPrefixes) {
		// Test gateway IPs (usually .1)
		const gatewayIp = `${prefix}.1`
		try {
			const response = await fetch(`http://${gatewayIp}`, {
				method: 'HEAD',
				signal: AbortSignal.timeout(1000),
			})
			if (response) {
				logger.info('UPNP-SSDP', `✓ Detected network: ${prefix}.x (gateway ${gatewayIp} responded)`)
				return prefix
			}
		} catch {
			// Gateway not responding, try next
		}
	}

	logger.error('UPNP-SSDP', 'Could not detect network, will scan all common networks')
	return null
}

/**
 * Get common local network prefixes to scan
 * Returns multiple common private network ranges
 */
const getCommonNetworkPrefixes = () => {
	// Common private network ranges
	return [
		'192.168.1',  // Most common home routers
		'192.168.0',  // Alternative common range
		'10.0.0',     // Some ISPs and corporate networks
		'192.168.2',  // Less common but used
	]
}

/**
 * Try to fetch device description from a potential UPNP device
 */
const tryFetchDeviceDescription = async (ip, port, timeout = 2000) => {
	const urls = [
		`http://${ip}:${port}/description.xml`,
		`http://${ip}:${port}/rootDesc.xml`,
		`http://${ip}:${port}/device.xml`,
		`http://${ip}:${port}/DeviceDescription.xml`,
	]

	for (const url of urls) {
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
				logger.info('UPNP-SSDP', `✓ Found device description at ${url}`)
				return { xml, url, ip, port }
			}
		} catch {
			// Timeout or connection refused - not a UPNP device
			continue
		}
	}

	return null
}

/**
 * Parse device info from XML
 * This is a simplified parser - a real implementation would use a proper XML parser
 */
const parseDeviceXml = (xml, ip, port) => {
	try {
		// Extract friendly name
		const friendlyNameMatch = xml.match(/<friendlyName>([^<]+)<\/friendlyName>/)
		const friendlyName = friendlyNameMatch ? friendlyNameMatch[1] : 'Unknown Device'

		// Extract manufacturer
		const manufacturerMatch = xml.match(/<manufacturer>([^<]+)<\/manufacturer>/)
		const manufacturer = manufacturerMatch ? manufacturerMatch[1] : 'Unknown'

		// Extract model
		const modelMatch = xml.match(/<modelName>([^<]+)<\/modelName>/)
		const model = modelMatch ? modelMatch[1] : 'Unknown'

		// Extract device type
		const deviceTypeMatch = xml.match(/<deviceType>([^<]+)<\/deviceType>/)
		const deviceType = deviceTypeMatch ? deviceTypeMatch[1] : ''

		// Check if it's a MediaRenderer (audio/video capable)
		const isMediaRenderer = deviceType.includes('MediaRenderer') ||
		                       deviceType.includes('MediaServer') ||
		                       xml.includes('AVTransport')

		// Extract UDN (Unique Device Name)
		const udnMatch = xml.match(/<UDN>([^<]+)<\/UDN>/)
		const udn = udnMatch ? udnMatch[1] : `uuid:${ip}:${port}`

		// Extract AVTransport control URL
		const controlUrlMatch = xml.match(/<serviceType>urn:schemas-upnp-org:service:AVTransport:1<\/serviceType>[\s\S]*?<controlURL>([^<]+)<\/controlURL>/)
		const controlUrl = controlUrlMatch ? controlUrlMatch[1] : '/upnp/control/rendertransport1'

		return {
			id: udn,
			name: friendlyName,
			host: ip,
			port: port,
			manufacturer: manufacturer,
			model: model,
			serviceUrl: `http://${ip}:${port}`,
			type: deviceType,
			isMediaRenderer: isMediaRenderer,
			controlUrl: controlUrl, // Add control URL
			rawXml: xml, // Keep for debugging
		}
	} catch (error) {
		logger.error('UPNP-SSDP', 'Error parsing device XML:', error)
		return null
	}
}

/**
 * Scan a range of IPs for UPNP devices
 */
export const scanNetwork = async (ipPrefixes = null, startIp = 1, endIp = 254) => {
	const prefixes = ipPrefixes || getCommonNetworkPrefixes()
	const prefixList = Array.isArray(prefixes) ? prefixes : [prefixes]

	logger.info('UPNP-SSDP', `Scanning networks: ${prefixList.join(', ')} (IPs ${startIp}-${endIp})`)

	const devices = []
	const deviceIds = new Set() // Avoid duplicates across networks
	const promises = []

	// Limit concurrent scans to avoid overwhelming the network
	const batchSize = 10

	for (const prefix of prefixList) {
		for (let i = startIp; i <= endIp; i++) {
			const ip = `${prefix}.${i}`

			for (const port of COMMON_PORTS) {
				promises.push(
					tryFetchDeviceDescription(ip, port, 1000)
						.then(result => {
							if (result) {
								const device = parseDeviceXml(result.xml, result.ip, result.port)
								if (device && device.isMediaRenderer) {
									// Check for duplicates (same device on multiple IPs)
									if (!deviceIds.has(device.id)) {
										deviceIds.add(device.id)
										logger.info('UPNP-SSDP', `Found device: ${device.name} at ${ip}:${port}`)
										devices.push(device)
									}
								}
							}
						})
						.catch(() => {
							// Ignore errors - most IPs won't have devices
						})
				)
			}

			// Process in batches
			if (promises.length >= batchSize) {
				await Promise.all(promises)
				promises.length = 0
			}
		}
	}

	// Wait for remaining promises
	if (promises.length > 0) {
		await Promise.all(promises)
	}

	logger.info('UPNP-SSDP', `Network scan completed, found ${devices.length} devices`)
	return devices
}

/**
 * Quick scan of common IPs across multiple networks (faster initial discovery)
 * @param {Function} onDeviceFound - Optional callback called when each device is found
 */
export const quickScan = async (onDeviceFound = null) => {
	// Try to detect the local network first
	const detectedNetwork = await detectLocalNetwork()
	const prefixes = detectedNetwork ? [detectedNetwork] : getCommonNetworkPrefixes()

	// Common router/device IPs
	const commonIps = [1, 2, 3, 4, 5, 10, 20, 40, 50, 100, 150, 200, 254]
	const totalScans = prefixes.length * commonIps.length * COMMON_PORTS.length

	logger.info('UPNP-SSDP', `Starting quick scan on networks: ${prefixes.join(', ')}`)
	logger.info('UPNP-SSDP', `Testing ${commonIps.length} IPs × ${COMMON_PORTS.length} ports = ${commonIps.length * COMMON_PORTS.length} endpoints per network`)
	logger.info('UPNP-SSDP', `Total: ${totalScans} endpoints across ${prefixes.length} networks`)

	const devices = []
	const deviceIds = new Set() // Avoid duplicates

	const promises = prefixes.flatMap(prefix =>
		commonIps.flatMap(lastOctet => {
			const ip = `${prefix}.${lastOctet}`
			return COMMON_PORTS.map(port =>
				tryFetchDeviceDescription(ip, port, 1500)
					.then(result => {
						if (result) {
							const device = parseDeviceXml(result.xml, result.ip, result.port)
							if (device) {
								logger.info('UPNP-SSDP', `Found device: ${device.name} (MediaRenderer: ${device.isMediaRenderer}) at ${ip}:${port}`)
								if (device.isMediaRenderer) {
									// Check for duplicates
									if (!deviceIds.has(device.id)) {
										deviceIds.add(device.id)
										devices.push(device)
										// Call callback immediately when device is found
										if (onDeviceFound) {
											onDeviceFound(device)
										}
									}
								}
							}
						}
					})
					.catch(() => {
						// Ignore
					})
			)
		})
	)

	await Promise.all(promises)
	logger.info('UPNP-SSDP', `Quick scan completed, found ${devices.length} MediaRenderer devices across ${prefixes.length} networks`)
	return devices
}

export default {
	scanNetwork,
	quickScan,
}
