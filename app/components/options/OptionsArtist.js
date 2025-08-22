import React from 'react'
import { useTranslation } from 'react-i18next'

import { ConfigContext } from '~/contexts/config'
import { getApiCacheFirst } from '~/utils/api'
import { playSong } from '~/utils/player'
import { SongDispatchContext } from '~/contexts/song'
import OptionsPopup from '~/components/popup/OptionsPopup'

const OptionsArtist = ({ artist, isOption, setIsOption }) => {
  const songDispatch = React.useContext(SongDispatchContext)
  const config = React.useContext(ConfigContext)
  const { t } = useTranslation()
  const refOption = React.useRef()

  const playSimilarSongs = () => {
    getApiCacheFirst(config, 'getSimilarSongs', `id=${artist.id}&count=50`)
      .then((json) => {
        if (json.similarSongs?.song) {
          playSong(config, songDispatch, json.similarSongs.song, 0)
        }
      })
      .catch(() => { })
    refOption.current.close()
  }

  const playTopSongs = () => {
    getApiCacheFirst(config, 'getTopSongs', { artist: artist.name, count: 50 })
      .then((json) => {
        if (json.topSongs?.song) {
          playSong(config, songDispatch, json.topSongs.song, 0)
        }
      })
      .catch(() => { })
    refOption.current.close()
  }

  return (
    <OptionsPopup
      ref={refOption}
      visible={isOption}
      close={() => { setIsOption(false) }}
      item={isOption ? artist : null}
      options={[
        {
          name: t('Play similar songs'),
          icon: 'play',
          onPress: playSimilarSongs
        },
        {
          name: t('Play top songs'),
          icon: 'arrow-up',
          onPress: playTopSongs
        },
        {
          name: t('Info'),
          icon: 'info',
          onPress: () => {
            refOption.current.showInfo(artist)
            refOption.current.close()
          }
        }
      ]}
    />
  )
}

export default OptionsArtist