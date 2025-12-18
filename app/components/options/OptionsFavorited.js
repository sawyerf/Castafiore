import React from 'react'
import { useTranslation } from 'react-i18next'

import { useConfig } from '~/contexts/config'
import { urlStream } from '~/utils/url'
import { downloadSong } from '~/utils/player'
import { useSettings } from '~/contexts/settings'
import OptionsPopup from '~/components/popup/OptionsPopup'

const OptionsFavorited = ({ favorited, isOpen, onClose }) => {
	const { t } = useTranslation()
	const config = useConfig()
	const refOption = React.useRef()
	const settings = useSettings()

	if (!favorited) return null
	return (
		<OptionsPopup
			ref={refOption}
			visible={isOpen}
			close={() => {
				onClose()
				refOption.current.clearVirtualOptions()
			}}
			options={[
				{
					name: t('Cache all songs'),
					icon: 'cloud-download',
					onPress: async () => {
						refOption.current.close()
						for (const song of favorited) {
							await downloadSong(urlStream(config, song.id, settings.streamFormat, settings.maxBitRate), song.id)
						}
					}
				},
			]}
		/>
	)
}

export default OptionsFavorited