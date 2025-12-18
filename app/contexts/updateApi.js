import React from 'react'

export const UpdateApiContext = React.createContext()
export const SetUpdateApiContext = React.createContext()

export const isUpdatable = (updateApi, path, query) => {
	if (updateApi.path !== path) return false
	if (!updateApi.query && !query) return true
	if (updateApi.query === query) return true
	return false
}