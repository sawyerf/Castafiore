import React from 'react'
import { Text, View, StyleSheet } from 'react-native'

import { useTheme } from '~/contexts/theme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BackButton from '~/components/button/BackButton'
import Icon from '~/components/Icon'
import IconButton from '~/components/button/IconButton'
import presStyles from '~/styles/pres'
import size from '~/styles/size'
import { HeaderGradient } from '~/components/PresHeader'

const PresHeaderIcon = ({ title, subTitle, icon, onPressOption = null, children = null }) => {
	const theme = useTheme()
	const insets = useSafeAreaInsets()

	return (
		<>
			<BackButton />
			{
				onPressOption ?
					<IconButton
						icon="ellipsis-h"
						onPress={onPressOption}
						color={theme.onImage}
						style={{
							position: 'absolute',
							padding: 20,
							top: insets.top,
							right: insets.left,
							zIndex: 1
						}}
					/> : null
			}
			<View style={[styles.cover, { paddingTop: insets.top + 60 }]}>
				<HeaderGradient theme={theme} height={260 + insets.top + 80} />
				<View style={[styles.tile, { backgroundColor: theme.primaryTouch }]}>
					<Icon name={icon} size={100} color={theme.innerTouch} />
				</View>
			</View>
			<Text style={presStyles.title(theme)}>{title}</Text>
			<Text style={presStyles.subTitle(theme)}>{subTitle}</Text>
			<View style={presStyles.headerContainer}>
				<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>{children}</View>
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	cover: {
		alignItems: 'center',
		paddingBottom: 20,
	},
	tile: {
		width: 260,
		height: 260,
		maxWidth: '60%',
		borderRadius: size.radius.sm,
		alignItems: 'center',
		justifyContent: 'center',
	},
})

export default PresHeaderIcon