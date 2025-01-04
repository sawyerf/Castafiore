import React from 'react';

import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import { getApi } from '~/utils/api';
import IconButton from './IconButton';

const FavoritedButton = ({ id, isFavorited = false, style = {}, size = 23 }) => {
	const [favorited, setFavorited] = React.useState(isFavorited)
	const theme = React.useContext(ThemeContext)
	const config = React.useContext(ConfigContext)

	React.useEffect(() => {
		setFavorited(isFavorited)
	}, [id, isFavorited])

	const onPressFavorited = () => {
		getApi(config, favorited ? 'unstar' : 'star', `id=${id}`)
			.then((json) => {
				setFavorited(!favorited)
			})
			.catch((error) => { })
	}

	return (
		<IconButton
			style={{
				padding: 20,
				...style,
			}}
			onPress={onPressFavorited}
			size={size}
			icon={favorited ? "heart" : "heart-o"}
			color={theme.primaryTouch}
		/>
	)
}

export default FavoritedButton;