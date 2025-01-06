import React from 'react';
import { View, ScrollView } from 'react-native';
import IconButton from '~/components/button/IconButton';
import { ThemeContext } from '~/contexts/theme';
import { SettingsContext } from '~/contexts/settings';

const CustomScroll = ({ children, data, renderItem, style = { width: '100%' }, contentContainerStyle = { paddingHorizontal: 20, columnGap: 10 } }) => {
	const refScroll = React.useRef(null)
	const theme = React.useContext(ThemeContext)
	const settings = React.useContext(SettingsContext)
	const indexScroll = React.useRef(0)

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
			{settings?.scrollHelper && <View
				style={{
					position: 'absolute',
					zIndex: 1,
					flexDirection: 'row',
					right: 10,
					top: -40,
					columnGap: 1,
				}}
			>
				<IconButton icon="chevron-left" size={20} onPress={goLeft} color={theme.secondaryLight}
					style={{
						backgroundColor: theme.secondaryDark,
						height: 30,
						width: 30,
						borderTopLeftRadius: 5,
						borderBottomLeftRadius: 5,
						justifyContent: 'center',
						alignItems: 'center',
					}} />
				<IconButton icon="chevron-right" size={20} onPress={goRight} color={theme.secondaryLight}
					style={{
						backgroundColor: theme.secondaryDark,
						height: 30,
						width: 30,
						borderTopRightRadius: 5,
						borderBottomRightRadius: 5,
						justifyContent: 'center',
						alignItems: 'center',
					}} />
			</View>}
			<ScrollView
				data={data}
				keyExtractor={(item, index) => index}
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

export default CustomScroll;