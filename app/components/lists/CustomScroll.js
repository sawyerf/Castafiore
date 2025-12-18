import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'

import IconButton from '~/components/button/IconButton'
import { useTheme } from '~/contexts/theme'
import { useSettings } from '~/contexts/settings'
import size from '~/styles/size'

const CustomScroll = ({ children, data, renderItem, style = { width: '100%' }, contentContainerStyle = { paddingHorizontal: 20, columnGap: 10 } }) => {
	const theme = useTheme()
	const settings = useSettings()
	const indexScroll = React.useRef(0)
	const refScroll = React.useRef(null)

	const goRight = () => {
		if (indexScroll.current + 3 >= data.length) indexScroll.current = data.length - 1
		else indexScroll.current = indexScroll.current + 30
		refScroll.current.scrollTo({ x: indexScroll.current, y: 0, animated: true, viewOffset: 10 })
	}

	const goLeft = () => {
		if (indexScroll.current < 3) indexScroll.current = 0
		else indexScroll.current = indexScroll.current - 30
		refScroll.current.scrollTo({ x: indexScroll.current, y: 0, animated: true, viewOffset: 10 })
	}

	// View is necessary to show the scroll helper
	return (
		<View>
			{settings?.scrollHelper &&
				<View style={styles.scrollContainer}>
					<IconButton icon="chevron-left" size={size.icon.tiny} onPress={goLeft} color={theme.secondaryText} style={styles.scrollHelper(theme)} />
					<IconButton icon="chevron-right" size={size.icon.tiny} onPress={goRight} color={theme.secondaryText} style={styles.scrollHelper(theme)} />
				</View>}
			<ScrollView
				data={data}
				keyExtractor={(_, index) => index}
				renderItem={renderItem}
				horizontal={true}
				style={style}
				contentContainerStyle={contentContainerStyle}
				showsHorizontalScrollIndicator={false}
				ref={refScroll}
			>
				{children}
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	scrollContainer: {
		position: 'absolute',
		zIndex: 1,
		flexDirection: 'row',
		right: 10,
		top: -40,
		columnGap: 1,
	},
	scrollHelper: theme => ({
		backgroundColor: theme.secondaryBack,
		height: 30,
		width: 30,
		borderTopLeftRadius: 5,
		borderBottomLeftRadius: 5,
		justifyContent: 'center',
		alignItems: 'center',
	}),
})

export default CustomScroll