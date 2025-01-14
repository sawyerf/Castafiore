import React from 'react'
import { Text, View, Pressable } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ConfigContext } from '~/contexts/config'
import { ThemeContext } from '~/contexts/theme'
import mainStyles from '~/styles/main'
import size from '~/styles/size'
import useKeyboardIsOpen from '~/utils/useKeyboardIsOpen'

const BottomBar = ({ state, descriptors, navigation }) => {
	const insets = useSafeAreaInsets()
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const keyboardIsOpen = useKeyboardIsOpen()

	return (
		<View style={{
			flexDirection: 'row',
			backgroundColor: theme.secondaryDark,
			borderTopColor: theme.secondaryDark,
			borderTopWidth: 1,
			paddingLeft: insets.left,
			paddingRight: insets.right,
			display: keyboardIsOpen ? 'none' : undefined,
		}}
		>
			{state.routes.map((route, index) => {
				const options = React.useMemo(() => descriptors[route.key].options, [])
				const isFocused = React.useMemo(() => state.index === index, [state.index, index])
				const color = React.useMemo(() => {
					if (isFocused) return theme.primaryTouch
					if (!config.query && route.name !== 'Settings') return theme.secondaryLight
					return theme.primaryLight
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
							paddingBottom: insets.bottom ? insets.bottom : 10,
							paddingTop: 10,
						}])}
						disabled={(!config.query && route.name !== 'Settings')}
					>
						<Icon name={options.icon} size={size.icon.tiny} color={color} style={{ alignSelf: 'center', marginBottom: 5 }} />
						<Text style={{ color: color, textAlign: 'center' }}>
							{options.title}
						</Text>
					</Pressable>
				)
			})}
		</View>
	)
}


export default BottomBar