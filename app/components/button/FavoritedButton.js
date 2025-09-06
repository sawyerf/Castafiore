import React from 'react'

import { SetUpdateApiContext } from '~/contexts/updateApi'
import { ConfigContext } from '~/contexts/config'
import { ThemeContext } from '~/contexts/theme'
import { getApi, refreshApi } from '~/utils/api'
import IconButton from '~/components/button/IconButton'
import logger from '~/utils/logger'

const FavoritedButton = ({ id, isFavorited = false, style = {}, size = 23 }) => {
	const [favorited, setFavorited] = React.useState(isFavorited)
	const theme = React.useContext(ThemeContext)
	const config = React.useContext(ConfigContext)
	const setUpdateApi = React.useContext(SetUpdateApiContext)

	React.useEffect(() => {
		setFavorited(isFavorited)
	}, [id, isFavorited])

	const onPressFavorited = () => {
		getApi(config, favorited ? 'unstar' : 'star', { id, albumId: id, artistId: id })
			.then(() => {
				setFavorited(!favorited)
				refreshApi(config, 'getStarred2', null)
					.then(() => {
						setUpdateApi({ path: 'getStarred2', query: null, uid: 1 })
					})
			})
			.catch((e) => logger.error('FavoritedButton', `${e}`))
	}

	return (
		<IconButton
			style={[{ padding: 20 }, style]}
			onPress={onPressFavorited}
			size={size}
			icon={favorited ? "heart" : "heart-o"}
			color={theme.primaryTouch}
		/>
	)
}

export default FavoritedButton