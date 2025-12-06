const defaultRemote = {
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

export const RemoteProvider = ({ children }) => {
	return children
}

export const useRemote = () => {
	return defaultRemote
}
