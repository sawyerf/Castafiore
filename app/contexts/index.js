import React from 'react'

import { SettingsProvider } from '~/contexts/settings'
import { RemoteProvider } from '~/contexts/remote'
import { ThemeProvider } from '~/contexts/theme'
import { ConfigProvider } from '~/contexts/config'
import { SongProvider } from '~/contexts/song'
import { UpdateApiProvider } from '~/contexts/updateApi'
import { useSong, useSongDispatch } from '~/contexts/song'
import Player from '~/utils/player'

const PlayerEvent = () => {
	const song = useSong()
	const songDispatch = useSongDispatch()

	Player.useEvent(song, songDispatch)
}

const AppProvider = ({ children }) => {
	return (
		<ConfigProvider>
			<SongProvider>
				<SettingsProvider>
					<ThemeProvider>
						<UpdateApiProvider>
							<RemoteProvider>
								<PlayerEvent />
								{children}
							</RemoteProvider>
						</UpdateApiProvider>
					</ThemeProvider>
				</SettingsProvider>
			</SongProvider>
		</ConfigProvider>
	)
}

export default AppProvider