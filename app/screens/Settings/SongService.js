import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { useSettings, useSetSettings } from '~/contexts/settings'
import { useTheme } from '~/contexts/theme'
import { searchCatalog } from '~/utils/songService'
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
	const [token, setToken] = React.useState(settings.songServiceToken)
	const [status, setStatus] = React.useState(null)

	React.useEffect(() => {
		setUrl(settings.songServiceUrl)
		setToken(settings.songServiceToken)
	}, [settings.songServiceUrl, settings.songServiceToken])

	const save = () => {
		const next = { ...settings, songServiceUrl: url.trim().replace(/\/$/, ''), songServiceToken: token.trim() }
		setSettings(next)
		if (!next.songServiceUrl) {
			setStatus(t('songService.Turned off'))
			return
		}
		setStatus(t('songService.Testing'))
		searchCatalog(next, 'test', 1)
			.then(() => setStatus(t('songService.Connected')))
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
						onChangeText={setUrl}
					/>
					<OptionInput
						title={t('songService.Access token')}
						placeholder={t('songService.Access token')}
						value={token}
						isPassword
						onChangeText={setToken}
						isLast
					/>
				</View>
				<Text style={settingStyles.description(theme)}>
					{t('songService.Description')}
				</Text>
				<ButtonText text={t('songService.Save and test')} onPress={save} />
				{status && <Text style={[settingStyles.description(theme), { textAlign: 'center' }]}>{status}</Text>}
			</View>
		</ScrollView>
	)
}

export default SongServiceSettings
