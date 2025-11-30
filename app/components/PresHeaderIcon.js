import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { ThemeContext } from '~/contexts/theme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BackButton from '~/components/button/BackButton'
import IconButton from '~/components/button/IconButton'
import presStyles from '~/styles/pres'

const PresHeaderIcon = ({ title, subTitle, icon, onPressOption = null, children = null }) => {
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
			<View style={styles.cover}>
				<Icon name={icon} size={100} color={'#cd1921'} />
			</View>
			<View style={presStyles.headerContainer}>
				<View style={{ flex: 1 }}>
					<Text style={presStyles.title(theme)}>{title}</Text>
					<Text style={presStyles.subTitle(theme)}>{subTitle}</Text>
				</View>
				{children}
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	cover: {
		width: "100%",
		height: 300,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#c68588',
	},
})

export default PresHeaderIcon