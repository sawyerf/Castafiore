import React from 'react'
import { Platform, Share } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

import { ConfigContext } from '~/contexts/config'
import { getApi, getApiNetworkFirst, urlStream } from '~/utils/api'
import { playSong, downloadSong } from '~/utils/player'
import { SongDispatchContext } from '~/contexts/song'
import { SettingsContext } from '~/contexts/settings'
import OptionsPopup from '~/components/popup/OptionsPopup'

const OptionsAlbum = ({ album, isOpen, onClose }) => {
  const { t } = useTranslation()
  const config = React.useContext(ConfigContext)
  const navigation = useNavigation()
  const refOption = React.useRef()
  const settings = React.useContext(SettingsContext)
  const songDispatch = React.useContext(SongDispatchContext)

  const playSimilarSongs = () => {
    getApiNetworkFirst(config, 'getSimilarSongs', `id=${album.id}&count=50`)
      .then((json) => {
        if (json.similarSongs?.song) playSong(config, songDispatch, json.similarSongs.song, 0)
      })
      .catch(() => { })
    refOption.current.close()
  }

  if (!album) return null
  return (
    <OptionsPopup
      ref={refOption}
      visible={isOpen}
      close={() => {
        onClose()
        refOption.current.clearVirtualOptions()
      }}
      item={album}
      options={[
        {
          name: t('Play similar songs'),
          icon: 'play',
          onPress: playSimilarSongs
        },
        {
          name: t('Cache all songs'),
          icon: 'cloud-download',
          onPress: async () => {
            refOption.current.close()
            for (const song of album.song) {
              await downloadSong(urlStream(config, song.id, settings.streamFormat, settings.maxBitRate), song.id)
            }
          }
        },
        {
          name: t('Go to genre'),
          icon: 'tag',
          onPress: () => {
            if (album.genres?.length > 1) {
              refOption.current.setVirtualOptions([
                {
                  name: t('Add to playlist'),
                },
                ...album.genres.map((genre) => ({
                  name: genre.name,
                  icon: 'tag',
                  onPress: () => {
                    navigation.navigate('Genre', { name: genre.name })
                    refOption.current.close()
                  }
                }))
              ])
            } else {
              navigation.navigate('Genre', { name: album.genres[0].name })
              refOption.current.close()
            }
          },
          hidden: !album.genres?.length
        },
        {
          name: t('Share'),
          icon: 'share',
          onPress: () => {
            getApi(config, 'createShare', { id: album.id })
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
            refOption.current.close()
            refOption.current.showInfo(album)
          }
        }
      ]}
    />
  )
}

export default OptionsAlbum