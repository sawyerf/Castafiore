const defaultRemote = {
	type: 'local',
	selectedDevice: null,
}

export const RemoteProvider = ({ children }) => {
	return children
}

export const useRemote = () => {
	return defaultRemote
}
