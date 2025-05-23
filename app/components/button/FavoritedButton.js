import React from 'react';

import { SetUpdateApiContext } from '~/contexts/updateApi';
import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import { getApi, getUrl } from '~/utils/api';
import { setJsonCache } from '~/utils/cache';
import IconButton from '~/components/button/IconButton';

const FavoritedButton = ({ id, isFavorited = false, style = {}, size = 23 }) => {
	const [favorited, setFavorited] = React.useState(isFavorited)
	const theme = React.useContext(ThemeContext)
	const config = React.useContext(ConfigContext)
	const setUpdateApi = React.useContext(SetUpdateApiContext)

	React.useEffect(() => {
		setFavorited(isFavorited)
	}, [id, isFavorited])

	const onPressFavorited = () => {
		getApi(config, favorited ? 'unstar' : 'star', `id=${id}`)
			.then(async () => {
				setFavorited(!favorited)
				getApi(config, 'getStarred', null)
					.then((json) => {
						const key = getUrl(config, 'getStarred', null)
						setJsonCache('api', key, json)
							.then(() => setUpdateApi({ path: 'getStarred', query: null, uid: 0 }))
					})
			})
			.catch(() => { })
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

export default FavoritedButton;