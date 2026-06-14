import React from 'react'

import { useConfig } from '~/contexts/config'
import { useSettings, useSetSettings } from '~/contexts/settings'
import { syncCachedPlaylists } from '~/utils/offlineSync'

// Headless component: on launch (once config and settings are loaded) it
// re-downloads missing songs and prunes removed ones for every kept playlist.
// If the server is unreachable the sync leaves the cache untouched.
const OfflineSync = () => {
	const config = useConfig()
	const settings = useSettings()
	const setSettings = useSetSettings()
	const running = React.useRef(false)

	React.useEffect(() => {
		if (!config?.url || !settings.cachedPlaylists?.length) return
		if (running.current) return
		running.current = true
		syncCachedPlaylists(config, settings, setSettings)
			.finally(() => { running.current = false })
	}, [config?.url, settings.cachedPlaylists])

	return null
}

export default OfflineSync
