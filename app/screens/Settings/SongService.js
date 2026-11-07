import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { useSettings, useSetSettings } from '~/contexts/settings'
import { useTheme } from '~/contexts/theme'
import { getMe } from '~/utils/songService'
import ButtonText from '~/components/settings/ButtonText'
import Header from '~/components/Header'
import mainStyles from '~/styles/main'
import OptionInput from '~/components/settings/OptionInput'
import settingStyles from '~/styles/settings'

const SongServiceSettings = () => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const theme = useTheme()
	const settings = useSettings()
	const setSettings = useSetSettings()
	const [url, setUrl] = React.useState(settings.songServiceUrl)
	const [status, setStatus] = React.useState(null)

	React.useEffect(() => {
		setUrl(settings.songServiceUrl)
	}, [settings.songServiceUrl])

	// Stored as typed; songService trims it when making requests.
	const values = (u) => ({ ...settings, songServiceUrl: u })

	// Save as the user types, so leaving the page never drops what was entered.
	const changeUrl = (value) => {
		setUrl(value)
		setSettings(values(value))
	}

	const test = () => {
		const next = values(url)
		if (!next.songServiceUrl.trim()) {
			setStatus(t('songService.Turned off'))
			return
		}
		setStatus(t('songService.Testing'))
		getMe(next)
			.then((me) => setStatus(t('songService.Connected as', { username: me.username })))
			.catch((error) => setStatus(error.message))
	}

	return (
		<ScrollView
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<Header title={t('songService.Song service')} />

			<View style={settingStyles.contentMainContainer}>
				<Text style={settingStyles.titleContainer(theme)}>{t('songService.Song service')}</Text>
				<View style={[settingStyles.optionsContainer(theme), { marginBottom: 5 }]}>
					<OptionInput
						title={t('Url')}
						placeholder="http://192.168.1.10:43019"
						value={url}
						inputMode="url"
						onChangeText={changeUrl}
						isLast
					/>
				</View>
				<Text style={settingStyles.description(theme)}>
					{t('songService.Description')}
				</Text>
				<ButtonText text={t('songService.Test connection')} onPress={test} />
				{status && <Text style={[settingStyles.description(theme), { textAlign: 'center' }]}>{status}</Text>}
			</View>
		</ScrollView>
	)
}

export default SongServiceSettings
