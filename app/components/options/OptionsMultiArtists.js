import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

import { ConfigContext } from '~/contexts/config'
import { urlCover } from '~/utils/url'
import OptionsPopup from '~/components/popup/OptionsPopup'
import size from '~/styles/size'

const OptionsMultiArtists = ({ artists, albumArtists = [], close, visible, setFullScreen = () => { } }) => {
	const { t } = useTranslation()
	const config = React.useContext(ConfigContext)
	const navigation = useNavigation()

	const artistOpt = (artist) => ({
		name: artist.name,
		image: urlCover(config, artist, 100),
		borderRadius: size.radius.circle,
		onPress: () => {
			navigation.navigate('Artist', { id: artist.id, name: artist.name })
			setFullScreen(false)
		}
	})

	return (
		<OptionsPopup
			visible={visible}
			close={close}
			options={[
				{
					name: t('Go to artist'),
				},
				...(albumArtists?.filter((artist) => artists.findIndex((a) => a.id === artist.id)).map(artistOpt) || []),
				...(artists?.map(artistOpt) || [])
			]}
		/>
	)
}

export default OptionsMultiArtists