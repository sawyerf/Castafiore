const defaultUpnp = {
	devices: [],
	selectedDevice: null,
	isConnected: false,
	currentStatus: {
		state: 'stopped',
		volume: 50,
		position: 0,
		duration: 0,
	}
}

export const UpnpProvider = ({ children }) => {
	return children
}

export const useUpnp = () => {
	return defaultUpnp
}
