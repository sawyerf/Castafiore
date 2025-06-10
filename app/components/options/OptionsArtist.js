import React from 'react';

import OptionsPopup from '~/components/popup/OptionsPopup';

const OptionsArtist = ({ artists, indexOptions, setIndexOptions }) => {
  const refOption = React.useRef()

  return (
    <OptionsPopup
      reff={refOption}
      visible={indexOptions >= 0}
      close={() => { setIndexOptions(-1) }}
      item={indexOptions >= 0 ? artists[indexOptions] : null}
      options={[
        {
          name: 'Info',
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