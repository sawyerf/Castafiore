import React from 'react'
import { Pressable, View, Text } from 'react-native'

import { ConfigContext } from '~/contexts/config'
import { ThemeContext } from '~/contexts/theme'
import { urlCover } from '~/utils/url'
import ImageError from '~/components/ImageError'
import FavoritedButton from '~/components/button/FavoritedButton'
import size from '~/styles/size'
import mainStyles from '~/styles/main'

const ExplorerItem = ({ item, title, subTitle, onPress, onLongPress, borderRadius = 0, iconError = null, isFavorited = null }) => {
	const theme = React.useContext(ThemeContext)
	const config = React.useContext(ConfigContext)

	return (
		<Pressable
			onPress={onPress}
			onLongPress={onLongPress}
			onContextMenu={(ev) => {
				ev.preventDefault()
				return onLongPress()
			}}
			style={{
				marginHorizontal: 20,
				minHeight: 70,
				marginBottom: 10,
				flexDirection: 'row',
				gap: 10,
			}}>
			<ImageError
				source={{ uri: urlCover(config, item, 100) }}
				iconError={iconError}
				style={{
					width: 70,
					height: 70,
					backgroundColor: theme.secondaryBack,
					borderRadius: borderRadius,
				}}
			/>
			<View style={{
				flex: 1,
				flexDirection: 'column',
				justifyContent: 'center',
			}}>
				<Text style={[mainStyles.mediumText(theme.primaryText), { marginBottom: 2 }]} numberOfLines={1}>
					{title}
				</Text>
				<Text numberOfLines={1} style={mainStyles.smallText(theme.secondaryText)}>
					{subTitle}
				</Text>
			</View>
			<FavoritedButton
				id={item.id}
				isFavorited={isFavorited}
				style={{ padding: 5, paddingStart: 10 }}
				size={size.icon.medium}
			/>
		</Pressable>
	)
}

export default ExplorerItem