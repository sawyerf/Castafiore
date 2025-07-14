import React from 'react'
import { Text, View, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import Icon from 'react-native-vector-icons/FontAwesome'

import { ConfigContext } from '~/contexts/config'
import { ThemeContext } from '~/contexts/theme'
import mainStyles from '~/styles/main'
import size from '~/styles/size'
import useKeyboardIsOpen from '~/utils/useKeyboardIsOpen'

const TabItem = ({ route, index, state, descriptors, navigation }) => {
	const { t } = useTranslation()
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)

	const options = React.useMemo(() => descriptors[route.key].options, [])
	const isFocused = React.useMemo(() => state.index === index, [state.index, index])
	const color = React.useMemo(() => {
		if (isFocused) return theme.primaryTouch
		if (!config.query && route.name !== 'Settings') return theme.secondaryText
		return theme.primaryText
	}, [isFocused, config.query, route.name, theme])

	const onPress = () => {
		const event = navigation.emit({
			type: 'tabPress',
			target: route.key,
			canPreventDefault: true,
		})

		if (!isFocused && !event.defaultPrevented) {
			navigation.navigate(route.name, route.params)
		}
	}

	const onLongPress = () => {
		navigation.emit({
			type: 'tabLongPress',
			target: route.key,
		})
	}

	return (
		<Pressable
			key={index}
			onPress={onPress}
			onLongPress={onLongPress}
			style={({ pressed }) => ([mainStyles.opacity({ pressed }), {
				flex: 1,
				paddingBottom: 3,
				paddingTop: 11,
			}])}
			disabled={(!config.query && route.name !== 'Settings')}
		>
			<Icon name={options.icon} size={size.icon.tiny} color={color} style={{ alignSelf: 'center', marginBottom: 2, height: 24 }} />
			<Text numberOfLines={1} style={{ color: color, textAlign: 'center', height: 19, fontSize: 14 }}>
				{t(`tabs.${options.title}`)}
			</Text>
		</Pressable>
	)
}

const BottomBar = ({ state, descriptors, navigation }) => {
	const insets = useSafeAreaInsets()
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const keyboardIsOpen = useKeyboardIsOpen()

	if (!config.url) return null
	return (
		<View style={{
			flexDirection: 'row',
			backgroundColor: theme.secondaryBack,
			paddingLeft: insets.left,
			paddingRight: insets.right,
			paddingBottom: insets.bottom ? insets.bottom : 10,
			display: keyboardIsOpen ? 'none' : undefined,
		}}
		>
			{state.routes.map((route, index) => (
				<TabItem
					key={index}
					route={route}
					state={state}
					index={index}
					descriptors={descriptors}
					navigation={navigation}
				/>
			))}
		</View>
	)
}

export default BottomBar