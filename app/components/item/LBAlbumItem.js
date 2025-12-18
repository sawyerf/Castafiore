import React from 'react'
import { Pressable, View, Text, Linking } from 'react-native'

import { ThemeContext } from '~/contexts/theme'
import ImageError from '~/components/ImageError'
import mainStyles from '~/styles/main'

const LBAlbumItem = ({ item }) => {
	const theme = React.useContext(ThemeContext)
	const coverUrl = React.useMemo(() => {
		if (typeof item === 'string') return ''
		return `http://coverartarchive.org/release/${item.release_mbid}/front`
	}, [item])

	if (typeof item === 'string') return (
		<Text style={[mainStyles.mediumText(theme.primaryText), {
			marginHorizontal: 20,
			marginTop: 20,
			marginBottom: 10, 
			borderBottomColor: theme.secondaryBack,
			borderBottomWidth: 2,
			paddingBottom: 5,
			paddingStart: 5,
		 }]}>
			{new Date(item).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
			})}
		</Text>
	)
	return (
		<Pressable
			onPress={() => Linking.openURL('https://listenbrainz.org/release/' + item.release_mbid)}
			style={{
				marginHorizontal: 20,
				minHeight: 70,
				marginBottom: 10,
				flexDirection: 'row',
				gap: 10,
			}}>
			<ImageError
				source={{ uri: coverUrl }}
				style={{
					width: 70,
					height: 70,
					backgroundColor: theme.secondaryBack,
				}}
			/>
			<View style={{
				flex: 1,
				flexDirection: 'column',
				justifyContent: 'center',
			}}>
				<Text style={[mainStyles.mediumText(theme.primaryText), { marginBottom: 2 }]} numberOfLines={1}>
					{item.release_name}
				</Text>
				<Text numberOfLines={1} style={mainStyles.smallText(theme.secondaryText)}>
					{item.release_group_primary_type} · {item.artist_credit_name}
				</Text>
			</View>
		</Pressable>
	)
}

export default LBAlbumItem