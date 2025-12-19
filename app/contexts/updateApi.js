import React from 'react'

export const UpdateApiContext = React.createContext()
export const SetUpdateApiContext = React.createContext()

export const useUpdateApi = () => React.useContext(UpdateApiContext)
export const useSetUpdateApi = () => React.useContext(SetUpdateApiContext)

export const isUpdatable = (updateApi, path, query) => {
	if (updateApi.path !== path) return false
	if (!updateApi.query && !query) return true
	if (updateApi.query === query) return true
	return false
}

export const UpdateApiProvider = ({ children }) => {
	const [updateApi, setUpdateApi] = React.useState({ path: null, query: null })

	return (
		<UpdateApiContext.Provider value={updateApi}>
			<SetUpdateApiContext.Provider value={setUpdateApi}>
				{children}
			</SetUpdateApiContext.Provider>
		</UpdateApiContext.Provider>
	)
}