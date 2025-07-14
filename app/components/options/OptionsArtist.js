import React from 'react';
import { useTranslation } from 'react-i18next';

import OptionsPopup from '~/components/popup/OptionsPopup';

const OptionsArtist = ({ artists, indexOptions, setIndexOptions }) => {
  const { t } = useTranslation();
  const refOption = React.useRef()

  return (
    <OptionsPopup
      ref={refOption}
      visible={indexOptions >= 0}
      close={() => { setIndexOptions(-1) }}
      item={indexOptions >= 0 ? artists[indexOptions] : null}
      options={[
        {
          name: t('Info'),
          icon: 'info',
          onPress: () => {
            refOption.current.showInfo(artists[indexOptions])
            setIndexOptions(-1)
          }
        }
      ]}
    />
  )
}

export default OptionsArtist;