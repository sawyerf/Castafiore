import React from 'react';
import { Text, View, TextInput, Image, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import theme from '~/utils/theme';
import { getApi } from '~/utils/api';

const FavoritedButton = ({ id, isFavorited = false, style = {}, config }) => {
	const [favorited, setFavorited] = React.useState(isFavorited)

	const onPressFavorited = () => {
		getApi(config, favorited ? 'unstar' : 'star', `id=${id}`)
			.then((json) => {
				setFavorited(!favorited)
			})
			.catch((error) => { })
	}

	return (
		<TouchableOpacity
			style={{
				padding: 20,
				...style,
			}}
			onPress={() => {
				onPressFavorited()
			}
			}>
			<Icon name={favorited ? "heart" : "heart-o"} size={23} color={theme.primaryTouch} />
		</TouchableOpacity>
	)
}

export default FavoritedButton;