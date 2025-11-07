/**
 * UPNP/DLNA Web Placeholder
 *
 * UPNP/DLNA discovery and control is not available in web browsers
 * due to security restrictions and lack of UDP multicast support.
 *
 * This file provides stub implementations that return empty results.
 */

import logger from '~/utils/logger'

export const discoverDevices = async (onDeviceFound = null) => {
	logger.info('UPNP', 'UPNP/DLNA is not supported in web browsers')
	return []
}

export const connectToDevice = async () => {
	logger.info('UPNP', 'UPNP/DLNA is not supported in web browsers')
	return false
}

export const playOnDevice = async () => {
	logger.info('UPNP', 'UPNP/DLNA is not supported in web browsers')
	return false
}

export const pauseOnDevice = async () => {
	logger.info('UPNP', 'UPNP/DLNA is not supported in web browsers')
	return false
}

export const stopOnDevice = async () => {
	logger.info('UPNP', 'UPNP/DLNA is not supported in web browsers')
	return false
}

export const seekOnDevice = async () => {
	logger.info('UPNP', 'UPNP/DLNA is not supported in web browsers')
	return false
}

export const setVolumeOnDevice = async () => {
	logger.info('UPNP', 'UPNP/DLNA is not supported in web browsers')
	return false
}

export const getDeviceStatus = async () => {
	logger.info('UPNP', 'UPNP/DLNA is not supported in web browsers')
	return null
}

export default {
	discoverDevices,
	connectToDevice,
	playOnDevice,
	pauseOnDevice,
	stopOnDevice,
	seekOnDevice,
	setVolumeOnDevice,
	getDeviceStatus,
}
