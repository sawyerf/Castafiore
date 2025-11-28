import React from 'react'
import { FlexWidget, IconWidget } from 'react-native-android-widget'
import * as Linking from 'expo-linking'


const heart = '\uF004'

const FavoritedWidget = () => {
	return (
		<FlexWidget
			style={{
				height: 'match_parent',
				width: 'match_parent',
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#c68588',
				borderRadius: 16,
			}}
			clickAction='OPEN_URI'
			clickActionData={{ uri: Linking.createURL('PlaylistsStack/Favorited') }}
		>
			<IconWidget
				font="FontAwesome"
				icon={heart}
				size={64}
				style={{
					color: "#cd1921"
				}}
			/>
		</FlexWidget>
	)
}

export default FavoritedWidget
