import React from 'react'

import { RemoteContext } from '~/contexts/remote/context'

export const useRemote = () => {
	const context = React.useContext(RemoteContext)
	if (!context) {
		throw new Error('useRemote must be used within RemoteProvider')
	}
	return context
}