import React from 'react'
import { Text, View, Pressable } from 'react-native'
import { ThemeContext } from '~/contexts/theme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import BackButton from '~/components/button/BackButton'
import mainStyles from '~/styles/main'
import presStyles from '~/styles/pres'
import ImageError from '~/components/ImageError'
import IconButton from '~/components/button/IconButton'

const PresHeader = ({ title, subTitle, imgSrc, onPressTitle = null, onPressOption = null, children = null }) => {
	const theme = React.useContext(ThemeContext)
	const insets = useSafeAreaInsets()

	return (
		<>
			<BackButton />
			{
				onPressOption ?
					<IconButton
						icon="ellipsis-h"
						onPress={onPressOption}
						color={'white'}
						style={{
							position: 'absolute',
							padding: 20,
							top: insets.top,
							right: insets.left,
							zIndex: 1
						}}
					/> : null
			}
			<ImageError
				style={[presStyles.cover, { backgroundColor: theme.secondaryBack }]}
				source={{ uri: imgSrc }}
			/>
			<View style={presStyles.headerContainer}>
				<View style={{ flex: 1 }}>
					<Text style={presStyles.title(theme)} numberOfLines={2}>{title}</Text>
					<Pressable
						style={mainStyles.opacity}
						onPress={onPressTitle}
						disabled={!onPressTitle}
					>
						<Text style={presStyles.subTitle(theme)}>{subTitle}</Text>
					</Pressable>
				</View>
				{children}
			</View>
		</>
	)
}

export default PresHeader