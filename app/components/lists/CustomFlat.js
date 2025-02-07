import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';

import { SettingsContext } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import IconButton from '~/components/button/IconButton';
import size from '~/styles/size';

const CustomScroll = ({ data, renderItem, style = { width: '100%' }, contentContainerStyle = { paddingHorizontal: 20, columnGap: 10 } }) => {
	const theme = React.useContext(ThemeContext)
	const settings = React.useContext(SettingsContext)
	const indexScroll = React.useRef(0)
	const refScroll = React.useRef(null)

	const goRight = () => {
		if (indexScroll.current + 3 >= data.length) indexScroll.current = data.length - 1
		else indexScroll.current = indexScroll.current + 3
		refScroll.current.scrollToIndex({ index: indexScroll.current, animated: true, viewOffset: 20 })
	}

	const goLeft = () => {
		if (indexScroll.current < 3) indexScroll.current = 0
		else indexScroll.current = indexScroll.current - 3
		refScroll.current.scrollToIndex({ index: indexScroll.current, animated: true, viewOffset: 20 })
	}

	// View is necessary to show the scroll helper
	return (
		<View>
			{settings?.scrollHelper &&
				<View style={styles.scrollContainer}>
					<IconButton icon="chevron-left" size={size.icon.tiny} onPress={goLeft} color={theme.secondaryLight} style={styles.scrollHelper(theme)} />
					<IconButton icon="chevron-right" size={size.icon.tiny} onPress={goRight} color={theme.secondaryLight} style={styles.scrollHelper(theme)} />
				</View>}
			<FlatList
				ref={refScroll}
				data={data}
				keyExtractor={(item, index) => `${item.id}-${index}`}
				renderItem={renderItem}
				horizontal={true}
				style={style}
				onScrollToIndexFailed={() => { }}
				contentContainerStyle={contentContainerStyle}
				showsHorizontalScrollIndicator={false}
			/>
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
		backgroundColor: theme.secondaryDark,
		height: 30,
		width: 30,
		borderTopLeftRadius: 5,
		borderBottomLeftRadius: 5,
		justifyContent: 'center',
		alignItems: 'center',
	}),
})

export default CustomScroll;