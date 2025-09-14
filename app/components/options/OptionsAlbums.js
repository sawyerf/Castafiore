import React from 'react'
import { Platform, Share } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

import { getApi } from '~/utils/api'
import { ConfigContext } from '~/contexts/config'
import OptionsPopup from '~/components/popup/OptionsPopup'
import { playSong } from '~/utils/player'
import { SongDispatchContext } from '~/contexts/song'
import { getApiNetworkFirst } from '~/utils/api'

const OptionsAlbums = ({ albums, indexOptions, setIndexOptions }) => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const config = React.useContext(ConfigContext)
  const refOption = React.useRef()
  const songDispatch = React.useContext(SongDispatchContext)

	const playSimilarSongs = () => {
		getApiNetworkFirst(config, 'getSimilarSongs', `id=${albums[indexOptions].id}&count=50`)
			.then((json) => {
				if (json.similarSongs?.song) playSong(config, songDispatch, json.similarSongs.song, 0)
			})
			.catch(() => { })
		refOption.current.close()
	}

  return (
    <OptionsPopup
      ref={refOption}
      visible={indexOptions >= 0}
      close={() => { setIndexOptions(-1) }}
      item={indexOptions >= 0 ? albums[indexOptions] : null}
      options={[
        {
          name: t('Play similar songs'),
					icon: 'play',
					onPress: playSimilarSongs
        },
        {
          name: t('Go to artist'),
          icon: 'user',
          onPress: () => {
            refOption.current.close()
            navigation.navigate('Artist', { id: albums[indexOptions].artistId, name: albums[indexOptions].artist })
          }
        },
        {
          name: t('Share'),
          icon: 'share',
          onPress: () => {
            getApi(config, 'createShare', { id: albums[indexOptions].id })
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
            refOption.current.showInfo(albums[indexOptions])
          }
        }
      ]}
    />
  )
}

export default OptionsAlbums