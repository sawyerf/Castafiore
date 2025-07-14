
import React from 'react';
import { Platform, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { getApi } from '~/utils/api';
import { ConfigContext } from '~/contexts/config';
import OptionsPopup from '~/components/popup/OptionsPopup';

const OptionsAlbum = ({ albums, indexOptions, setIndexOptions }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const config = React.useContext(ConfigContext)
  const refOption = React.useRef()

  return (
    <OptionsPopup
      ref={refOption}
      visible={indexOptions >= 0}
      close={() => { setIndexOptions(-1) }}
      item={indexOptions >= 0 ? albums[indexOptions] : null}
      options={[
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

export default OptionsAlbum;