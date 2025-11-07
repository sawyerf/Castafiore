import React, { useState, useContext, useMemo } from 'react'

const UpnpContext = React.createContext()

export const defaultUpnp = {
	devices: [],
	selectedDevice: null,
	isConnected: false,
	currentStatus: {
		state: 'stopped', // 'playing', 'paused', 'stopped'
		volume: 50,
		position: 0,
		duration: 0,
	}
}

export const UpnpProvider = ({ children }) => {
	const [devices, setDevices] = useState([])
	const [selectedDevice, setSelectedDevice] = useState(null)
	const [isConnected, setIsConnected] = useState(false)
	const [currentStatus, setCurrentStatus] = useState(defaultUpnp.currentStatus)

	const value = useMemo(() => ({
		devices,
		selectedDevice,
		isConnected,
		currentStatus,
		// Helper functions
		setDevices,
		selectDevice: (device) => {
			setSelectedDevice(device)
			setIsConnected(device !== null)
		},
		updateStatus: (status) => {
			setCurrentStatus(prev => ({ ...prev, ...status }))
		},
		setConnected: setIsConnected,
		reset: () => {
			setDevices([])
			setSelectedDevice(null)
			setIsConnected(false)
			setCurrentStatus(defaultUpnp.currentStatus)
		}
	}), [devices, selectedDevice, isConnected, currentStatus])

	return (
		<UpnpContext.Provider value={value}>
			{children}
		</UpnpContext.Provider>
	)
}

export const useUpnp = () => {
	const context = useContext(UpnpContext)
	if (!context) {
		throw new Error('useUpnp must be used within UpnpProvider')
	}
	return context
}
