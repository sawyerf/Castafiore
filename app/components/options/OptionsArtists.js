import React from 'react'
import { useTranslation } from 'react-i18next'

import { ConfigContext } from '~/contexts/config'
import { getApiNetworkFirst } from '~/utils/api'
import { playSong } from '~/utils/player'
import { SongDispatchContext } from '~/contexts/song'
import OptionsPopup from '~/components/popup/OptionsPopup'

const OptionsArtists = ({ artists, indexOptions, setIndexOptions }) => {
	const songDispatch = React.useContext(SongDispatchContext)
	const config = React.useContext(ConfigContext)
	const { t } = useTranslation()
	const refOption = React.useRef()

	const playSimilarSongs = () => {
		getApiNetworkFirst(config, 'getSimilarSongs', `id=${artists[indexOptions].id}&count=50`)
			.then((json) => {
				if (json.similarSongs?.song) {
					playSong(config, songDispatch, json.similarSongs.song, 0)
				}
			})
			.catch(() => { })
		refOption.current.close()
	}

	return (
		<OptionsPopup
			ref={refOption}
			visible={indexOptions >= 0}
			close={() => { setIndexOptions(-1) }}
			item={indexOptions >= 0 ? artists[indexOptions] : null}
			options={[
				{
					name: t('Play similar songs'),
					icon: 'play',
					onPress: playSimilarSongs
				},
				{
					name: t('Info'),
					icon: 'info',
					onPress: () => {
						refOption.current.showInfo(artists[indexOptions])
						refOption.current.close()
					}
				}
			]}
		/>
	)
}

export default OptionsArtists