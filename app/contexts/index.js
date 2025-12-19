import React from 'react'

import { SettingsProvider } from '~/contexts/settings'
import { RemoteProvider } from '~/contexts/remote'
import { ThemeProvider } from '~/contexts/theme'
import { ConfigProvider } from '~/contexts/config'
import { SongProvider } from '~/contexts/song'
import { UpdateApiProvider } from '~/contexts/updateApi'

const AppProvider = ({ children }) => {
	return (
		<ConfigProvider>
			<SongProvider>
				<SettingsProvider>
					<ThemeProvider>
						<UpdateApiProvider>
							<RemoteProvider>
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