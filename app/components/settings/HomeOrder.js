import React from 'react'
import { View, Text, PanResponder, Animated, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import Icon from 'react-native-vector-icons/FontAwesome'

import { useSettings, useSetSettings, homeSections } from '~/contexts/settings'
import { useTheme } from '~/contexts/theme'
import settingStyles from '~/styles/settings'

const HomeOrder = () => {
	const { t } = useTranslation()
	const settings = useSettings()
	const setSettings = useSetSettings()
	const theme = useTheme()
	const [indexMoving, setIndexMoving] = React.useState(-1)
	const [moveToIndex, setMoveToIndex] = React.useState(-1)

	const moveElement = (index, direction) => {
		let newIndex = index + direction
		if (newIndex < 0) newIndex = 0
		if (newIndex >= settings.homeOrderV2.length) newIndex = settings.homeOrderV2.length - 1
		if (index === newIndex) return
		const newHomeOrder = [...settings.homeOrderV2]
		if (direction > 0) {
			newHomeOrder.splice(newIndex + 1, 0, newHomeOrder[index])
			newHomeOrder.splice(index, 1)
		} else {
			newHomeOrder.splice(index, 1)
			newHomeOrder.splice(newIndex, 0, settings.homeOrderV2[index])
		}
		setSettings({ ...settings, homeOrderV2: newHomeOrder })
	}

	const onPressHomeOrder = (index) => {
		const newHomeOrder = [...settings.homeOrderV2]
		newHomeOrder[index].enable = !newHomeOrder[index].enable
		setSettings({ ...settings, homeOrderV2: newHomeOrder })
	}

	return (
		<>
			{
				settings.homeOrderV2.map((value, index) => {
					const startMove = React.useRef(0)
					const position = React.useRef(new Animated.Value(0)).current
					const panResponder = PanResponder.create({
						onStartShouldSetPanResponder: () => true,
						onMoveShouldSetPanResponder: () => true,
						onPanResponderGrant: (_, gestureState) => {
							startMove.current = gestureState.y0
							position.setValue(0)
							setIndexMoving(index)
							setMoveToIndex(index)
						},
						onPanResponderMove: (_, gestureState) => {
							const move = gestureState.moveY - startMove.current
							position.setValue(move)
							setMoveToIndex(index + Math.round(move / 50))
						},
						onPanResponderRelease: () => {
							setIndexMoving(-1)
							setMoveToIndex(-1)
							if (position._value === 0) {
								onPressHomeOrder(index)
							}
							moveElement(index, Math.round(position._value / 50))
							position.setValue(0)
							startMove.current = 0
						}
					})
					const section = React.useMemo(() => homeSections.find(s => s.id === value.id), [value.id])

					const translateY = () => {
						if (index === indexMoving) return position
						if (indexMoving === -1) return 0
						if (index > indexMoving && index <= moveToIndex) return -50
						if (index < indexMoving && index >= moveToIndex) return 50
						return 0
					}

					return (
						<Animated.View
							key={index}
							style={[
								settingStyles.optionItem(theme, index == settings.homeOrderV2.length - 1),
								{
									cursor: 'pointer',
									transform: [{ translateY: translateY() }]
								}
							]}
						>
							<Pressable
								onPress={() => onPressHomeOrder(index)}
								style={{ flex: 1, height: '100%', flexDirection: 'row', alignItems: 'center' }}
							>
								<View style={{ width: 22, marginEnd: 10, alignItems: 'center' }}>
									<Icon
										name={section.icon}
										size={18}
										color={value.enable ? theme.primaryTouch : theme.secondaryText}
									/>
								</View>
								<Text key={index} style={{ color: value.enable ? theme.primaryTouch : theme.secondaryText, flex: 1 }}>{t(`homeSection.${section.title}`)}</Text>
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

export default HomeOrder