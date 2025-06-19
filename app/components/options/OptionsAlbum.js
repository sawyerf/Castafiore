
import React from 'react';
import { Platform, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { getApi } from '~/utils/api';
import { ConfigContext } from '~/contexts/config';
import OptionsPopup from '~/components/popup/OptionsPopup';

const OptionsAlbum = ({ albums, indexOptions, setIndexOptions }) => {
  const navigation = useNavigation();
  const config = React.useContext(ConfigContext)
  const refOption = React.useRef()

  return (
    <OptionsPopup
      reff={refOption}
      visible={indexOptions >= 0}
      close={() => { setIndexOptions(-1) }}
      item={indexOptions >= 0 ? albums[indexOptions] : null}
      options={[
        {
          name: 'Go to artist',
          icon: 'user',
          onPress: () => {
            refOption.current.close()
            navigation.navigate('Artist', { id: albums[indexOptions].artistId, name: albums[indexOptions].artist })
          }
        },
        {
          name: 'Share',
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
          name: 'Info',
          icon: 'info',
          onPress: () => {
            refOption.current.close();
            refOption.current.showInfo(albums[indexOptions])
          }
        }
      ]}
    />
  )
}

export default OptionsAlbum;