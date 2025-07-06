import React from 'react';
import { View, Text, PanResponder, Animated, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome';

import { SettingsContext, SetSettingsContext } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import settingStyles from '~/styles/settings';

const HomeOrder = () => {
	const { t } = useTranslation()
	const settings = React.useContext(SettingsContext)
	const setSettings = React.useContext(SetSettingsContext)
	const theme = React.useContext(ThemeContext)

	const moveElement = (index, direction) => {
		let newIndex = index + direction
		if (newIndex < 0) newIndex = 0
		if (newIndex >= settings.homeOrder.length) newIndex = settings.homeOrder.length - 1
		if (index === newIndex) return
		const newHomeOrder = [...settings.homeOrder]
		if (direction > 0) {
			newHomeOrder.splice(newIndex + 1, 0, newHomeOrder[index])
			newHomeOrder.splice(index, 1)
		} else {
			newHomeOrder.splice(index, 1)
			newHomeOrder.splice(newIndex, 0, settings.homeOrder[index])
		}
		setSettings({ ...settings, homeOrder: newHomeOrder })
	}

	const onPressHomeOrder = (index) => {
		const newHomeOrder = [...settings.homeOrder]
		newHomeOrder[index].enable = !newHomeOrder[index].enable
		setSettings({ ...settings, homeOrder: newHomeOrder })
	}

	return (
		<>
			{
				settings.homeOrder.map((value, index) => {
					const startMove = React.useRef(0)
					const position = React.useRef(new Animated.Value(0)).current
					const panResponder = PanResponder.create({
						onStartShouldSetPanResponder: () => true,
						onMoveShouldSetPanResponder: () => true,
						onPanResponderGrant: (_, gestureState) => {
							startMove.current = gestureState.y0
							position.setValue(0)
						},
						onPanResponderMove: (_, gestureState) => {
							const move = gestureState.moveY - startMove.current
							position.setValue(move)
						},
						onPanResponderRelease: () => {
							if (position._value === 0) {
								onPressHomeOrder(index)
							}
							moveElement(index, Math.round(position._value / 50))
							position.setValue(0)
							startMove.current = 0
						}
					})

					return (
						<Animated.View
							key={index}
							style={[
								settingStyles.optionItem(theme, index == settings.homeOrder.length - 1),
								{
									cursor: 'pointer',
									transform: [{ translateY: position }]
								}
							]}
						>
							<Pressable
								onPress={() => onPressHomeOrder(index)}
								style={{ flex: 1, height: '100%', flexDirection: 'row', alignItems: 'center' }}
							>
								<View style={{ width: 22, marginEnd: 10, alignItems: 'center' }}>
									<Icon
										name={value.icon}
										size={18}
										color={value.enable ? theme.primaryTouch : theme.secondaryText}
									/>
								</View>
								<Text key={index} style={{ color: value.enable ? theme.primaryTouch : theme.secondaryText, flex: 1 }}>{t(`homeSection.${value.title}`)}</Text>
							</Pressable>
							<View
								style={{
									height: '100%',
									justifyContent: 'center',
									touchAction: 'none',
								}}
								{...panResponder.panHandlers}
							>
								<Icon
									name="bars"
									size={18}
									color={theme.secondaryText}
									style={{ marginEnd: 5 }}
								/>
							</View>
						</Animated.View>
					)
				})
			}
		</>
	)
}

export default HomeOrder;