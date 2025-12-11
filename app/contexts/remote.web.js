const defaultRemote = {
	selectedDevice: null,
}

export const RemoteProvider = ({ children }) => {
	return children
}

export const useRemote = () => {
	return defaultRemote
}
