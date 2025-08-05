import React from 'react';
import { View, FlatList, StyleSheet, useWindowDimensions } from 'react-native';

import { ThemeContext } from '~/contexts/theme';
import { SettingsContext } from '~/contexts/settings';
import IconButton from '~/components/button/IconButton';
import size from '~/styles/size';

const CustomFlat = ({ data, renderItem, style = { width: '100%' }, contentContainerStyle = { paddingHorizontal: 20, columnGap: 10 }, widthItem = 0 }) => {
	const theme = React.useContext(ThemeContext)
	const settings = React.useContext(SettingsContext)
	const indexScroll = React.useRef(0)
	const refScroll = React.useRef(null)
	const [isScrollHelper, setIsScrollHelper] = React.useState(false)
	const { width } = useWindowDimensions()
	const visibleItems = React.useMemo(() => {
		if (widthItem > 0) return width / widthItem
		else return 3
	}, [width, widthItem])
	const [isLeftVisible, setIsLeftVisible] = React.useState(false);
	const [isRightVisible, setIsRightVisible] = React.useState(true);

	const goRight = () => {
		if (Math.floor(indexScroll.current) + Math.floor(visibleItems) >= data.length) indexScroll.current = data.length - 1
		else indexScroll.current = Math.floor(indexScroll.current) + Math.floor(visibleItems)
		setVisibility()
		refScroll.current.scrollToIndex({ index: indexScroll.current, animated: true, viewOffset: 20 })
	}

	const goLeft = () => {
		if (indexScroll.current < Math.floor(visibleItems)) indexScroll.current = 0
		else indexScroll.current = indexScroll.current - Math.floor(visibleItems)
		setVisibility()
		refScroll.current.scrollToIndex({ index: indexScroll.current, animated: true, viewOffset: 20 })
	}

	const setVisibility = () => {
		if (indexScroll.current === 0) setIsLeftVisible(false)
		else setIsLeftVisible(true)
		if (widthItem > 0) {
			if (indexScroll.current + visibleItems >= data.length) setIsRightVisible(false)
			else setIsRightVisible(true)
		}
	}

	// https://github.com/facebook/react-native/issues/39421
	if (!data || data.length === 0) return null;

	return (
		<View
			onPointerEnter={() => setIsScrollHelper(settings.scrollHelper && true)}
			onPointerLeave={() => setIsScrollHelper(false)}
		>
			{
				(isScrollHelper && isLeftVisible) ? (
					<View style={[styles.scrollContainer, { left: 0 }]}>
						<IconButton icon="angle-left" size={size.icon.tiny} onPress={goLeft} color={theme.primaryText} pressEffect={false}
							styleIcon={{ lineHeight: size.icon.tiny }}
							style={styles.scrollHelper(theme)} />
					</View>
				) : null
			}
			{
				(isScrollHelper && isRightVisible) ? (
					<View style={[styles.scrollContainer, { right: 0 }]}>
						<IconButton icon="angle-right" size={size.icon.tiny} onPress={goRight} color={theme.primaryText}
							pressEffect={false}
							style={styles.scrollHelper(theme)} />
					</View>
				) : null
			}
			<FlatList
				ref={refScroll}
				data={data}
				keyExtractor={(item, index) => index}
				renderItem={renderItem}
				horizontal={true}
				style={style}
				onScroll={({ nativeEvent }) => {
					if (widthItem > 0) {
						const index = nativeEvent.contentOffset.x / widthItem
						if (index < 0) indexScroll.current = 0
						else indexScroll.current = index
						setVisibility()
					}
				}}
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
		top: 0,
		bottom: 0,
		justifyContent: 'center',
	},
	scrollHelper: theme => ({
		width: size.icon.tiny + 20,
		height: size.icon.tiny + 20,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: theme.secondaryBack,
		borderRadius: size.radius.circle,
		marginHorizontal: 10,
	}),
})

export default CustomFlat;