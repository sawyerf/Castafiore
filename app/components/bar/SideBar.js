import React from 'react'
import { Text, View, Pressable, Image, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ConfigContext } from '~/contexts/config'
import { ThemeContext } from '~/contexts/theme'
import pkg from '~/../package.json'
import size from '~/styles/size'
import mainStyles from '~/styles/main'

const SideBar = ({ state, descriptors, navigation }) => {
	const insets = useSafeAreaInsets()
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)

	return (
		<View style={styles.container(insets, theme)}>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					width: '100%',
					marginHorizontal: 10,
					marginTop: 15,
					marginBottom: 15,
				}}>
				<Image
					source={require('~/../assets/icon.png')}
					style={mainStyles.icon}
				/>
				<View style={{ flexDirection: 'column', justifyContent: 'center' }}>
					<Text style={{ color: theme.primaryLight, fontSize: size.text.large, marginBottom: 0 }}>Castafiore</Text>
					<Text style={{ color: theme.secondaryLight, fontSize: size.text.small }}>Version {pkg.version}</Text>
				</View>
			</View>
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
							flexDirection: 'row',
							alignItems: 'center',
							backgroundColor: isFocused ? theme.primaryDark : undefined,
							marginHorizontal: 10,
							paddingVertical: 4,
							paddingLeft: 10,
							borderRadius: 8,
							marginBottom: 3,
						}])}
						disabled={(!config.query && route.name !== 'Settings')}
					>
						<Icon name={options.icon} size={26} color={color} style={{ marginRight: 10 }} />
						<Text style={{ color: color, textAlign: 'left', fontSize: size.text.large, fontWeight: '600' }}>
							{options.title}
						</Text>
					</Pressable>
				)
			})}
		</View>
	)
}

const styles = StyleSheet.create({
	container: (insets, theme) => ({
		flexDirection: 'column',
		backgroundColor: theme.secondaryDark,
		borderTopColor: theme.secondaryDark,
		borderTopWidth: 1,
		height: '100%',
		width: 250,
		paddingLeft: insets.left,
		paddingRight: insets.right,
		borderEndWidth: 1,
		borderEndColor: theme.tertiaryDark,
	}),
})

export default SideBar