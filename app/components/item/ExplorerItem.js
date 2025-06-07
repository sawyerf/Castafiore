import React from 'react';
import { Pressable, View, Text } from 'react-native';

import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import ImageError from '~/components/ImageError';
import FavoritedButton from '~/components/button/FavoritedButton';
import size from '~/styles/size';

const ExplorerItem = ({ item, title, subTitle, onPress, borderRadius = 0, iconError = null, isFavorited = null }) => {
	const theme = React.useContext(ThemeContext);
	const config = React.useContext(ConfigContext);

	return (
		<Pressable
			onPress={onPress}
			style={{
				marginHorizontal: 20,
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
				<Text
					style={{
						color: theme.primaryText,
						fontSize: size.text.medium,
						overflow: 'hidden',
						marginBottom: 2,
					}}
					numberOfLines={1}
				>
					{title}
				</Text>
				<Text numberOfLines={1} style={{ color: theme.secondaryText, fontSize: size.text.small }}>
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
	);
}

export default ExplorerItem;