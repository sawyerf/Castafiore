import React from 'react'
import { Platform, Share } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

import { useConfig } from '~/contexts/config'
import { getApi } from '~/utils/api'
import { urlStream } from '~/utils/url'
import { downloadSong } from '~/utils/player'
import { useSettings } from '~/contexts/settings'
import OptionsPopup from '~/components/popup/OptionsPopup'

const OptionsPlaylist = ({ playlist, open, onClose, onRefresh }) => {
	const { t } = useTranslation()
	const navigation = useNavigation()
	const config = useConfig()
	const refOption = React.useRef()
	const settings = useSettings()

	if (!playlist) return null
	return (
		<OptionsPopup
			ref={refOption}
			visible={open}
			close={onClose}
			item={playlist}
			options={[
				{
					name: t('Cache all songs'),
					icon: 'cloud-download',
					onPress: async () => {
						refOption.current.close()
						for (const song of playlist.entry) {
							await downloadSong(urlStream(config, song.id, settings.streamFormat, settings.maxBitRate), song.id)
						}
					}
				},
				{
					name: t('Edit playlist'),
					icon: 'pencil',
					onPress: () => {
						navigation.navigate('EditPlaylist', { playlist: playlist })
						refOption.current.close()
					}
				},
				{
					name: (playlist?.public) ? t('Make private') : t('Make public'),
					icon: (playlist?.public) ? 'lock' : 'globe',
					onPress: () => {
						getApi(config, 'updatePlaylist', {
							playlistId: playlist.id,
							public: !playlist.public,
						})
							.then(() => {
								onRefresh()
								refOption.current.close()
							})
							.catch(() => { })
					}
				},
				{
					name: t('Share'),
					icon: 'share',
					onPress: () => {
						getApi(config, 'createShare', { id: playlist.id })
							.then((json) => {
								if (json.shares.share.length > 0) {
									if (Platform.OS === 'web') navigator.clipboard.writeText(json.shares.share[0].url)
									else Share.share({ message: json.shares.share[0].url })
								}
							})
							.catch(() => { })
						refOption.current.close()
					}
				},
				{
					name: t('Info'),
					icon: 'info',
					onPress: () => {
						refOption.current.showInfo(playlist)
						refOption.current.close()
					}
				},
			]}
		/>
	)
}

export default OptionsPlaylist