/**
 * Chromecast Discovery and Control Module
 *
 * This module provides functionality to discover and control Chromecast devices
 * on the local network using react-native-google-cast.
 *
 * Note: This is a native-only module. Chromecast is not available in web browsers.
 */

import GoogleCast from 'react-native-google-cast'
import logger from '~/utils/logger'

/**
 * Discover Chromecast devices on the network
 * Check if the user has a session or can show the Cast picker.
 *
 * @param {Function} onDeviceFound - Optional callback called when device is connected
 * @returns {Promise<Array>} Array of discovered devices (empty - use showCastPicker instead)
 */
export const discoverDevices = async (onDeviceFound = null) => {
	logger.info('Chromecast', 'Checking Chromecast availability...')

	try {
		// Check if Cast SDK is available
		const castState = await GoogleCast.getCastState()
		logger.info('Chromecast', `Current cast state: ${castState}`)

		// Check if there's an active session
		const sessionManager = GoogleCast.getSessionManager()
		const currentSession = await sessionManager.getCurrentCastSession()

		if (currentSession) {
			// There's an active session, create a device entry
			const device = {
				id: 'chromecast-session',
				name: currentSession.device?.friendlyName || 'Chromecast',
				manufacturer: 'Google',
				serviceUrl: '',
				controlUrl: '',
				type: 'chromecast',
				rawDevice: currentSession.device
			}

			if (onDeviceFound) {
				onDeviceFound(device)
			}

			logger.info('Chromecast', `Found active session: ${device.name}`)
			return [device]
		}

		// No active session - user needs to use the Cast button to connect
		logger.info('Chromecast', 'No active session. Use Cast button to connect.')
		return []
	} catch (error) {
		logger.error('Chromecast', 'Discovery error:', error)
		return []
	}
}

/**
 * Show native Chromecast picker dialog
 * This is the recommended way to let users select a Chromecast device
 * @returns {Promise<void>}
 */
export const showCastPicker = async () => {
	try {
		// In react-native-google-cast v4, use showIntroductory to show the picker
		// Or use the CastButton component which handles this automatically
		const sessionManager = GoogleCast.getSessionManager()
		await sessionManager.endCurrentSession()
		await sessionManager.startSession()
	} catch (error) {
		logger.error('Chromecast', 'Show picker error:', error)
		throw error
	}
}

/**
 * Connect to a specific Chromecast device
 * @param {Object} device - Target device
 * @returns {Promise<boolean>} Success status
 */
export const connectToDevice = async (device) => {
	logger.info('Chromecast', `Connecting to device: ${device.name}`)

	try {
		// With react-native-google-cast, connection is usually handled automatically
		// when user selects a device from the cast picker
		// This function is here for API consistency with UPNP
		const castState = await GoogleCast.getCastState()
		logger.info('Chromecast', `Cast state: ${castState}`)

		return castState === 'connected' || castState === 'connecting'
	} catch (error) {
		logger.error('Chromecast', 'Connect error:', error)
		return false
	}
}

/**
 * Disconnect from current Chromecast device
 * @returns {Promise<boolean>} Success status
 */
export const disconnectFromDevice = async () => {
	try {
		await GoogleCast.endSession()
		return true
	} catch (error) {
		logger.error('Chromecast', 'Disconnect error:', error)
		return false
	}
}

/**
 * Get current Chromecast connection state
 * @returns {Promise<string>} Cast state: 'noDevicesAvailable', 'notConnected', 'connecting', 'connected'
 */
export const getCastState = async () => {
	try {
		const state = await GoogleCast.getCastState()
		return state
	} catch (error) {
		logger.error('Chromecast', 'Get cast state error:', error)
		return 'notConnected'
	}
}

/**
 * Setup Chromecast session listener
 * @param {Function} onSessionStarted - Called when session starts
 * @param {Function} onSessionEnded - Called when session ends
 * @returns {Function} Cleanup function to remove listeners
 */
export const setupSessionListeners = (onSessionStarted, onSessionEnded) => {
	let sessionStartedListener = null
	let sessionEndedListener = null

	try {
		const sessionManager = GoogleCast.getSessionManager()

		sessionStartedListener = sessionManager.onSessionStarted(() => {
			onSessionStarted?.()
		})

		sessionEndedListener = sessionManager.onSessionEnded(() => {
			onSessionEnded?.()
		})
	} catch (error) {
		logger.error('Chromecast', 'Failed to setup session listeners:', error)
	}

	// Return cleanup function
	return () => {
		if (sessionStartedListener) {
			sessionStartedListener.remove?.()
		}
		if (sessionEndedListener) {
			sessionEndedListener.remove?.()
		}
	}
}

export default {
	discoverDevices,
	showCastPicker,
	connectToDevice,
	disconnectFromDevice,
	getCastState,
	setupSessionListeners,
}
