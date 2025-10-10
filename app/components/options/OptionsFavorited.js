import React from 'react'
import { useTranslation } from 'react-i18next'

import { ConfigContext } from '~/contexts/config'
import { urlStream } from '~/utils/api'
import { downloadSong } from '~/utils/player'
import { SettingsContext } from '~/contexts/settings'
import OptionsPopup from '~/components/popup/OptionsPopup'

const OptionsFavorited = ({ favorited, isOpen, onClose }) => {
  const { t } = useTranslation()
  const config = React.useContext(ConfigContext)
  const refOption = React.useRef()
  const settings = React.useContext(SettingsContext)

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
            for (const song of favorited.song) {
              await downloadSong(urlStream(config, song.id, settings.streamFormat, settings.maxBitRate), song.id)
            }
          }
        },
      ]}
    />
  )
}

export default OptionsFavorited