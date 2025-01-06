import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { SettingsContext, SetSettingsContext } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import settingStyles from '~/styles/settings';
import IconButton from '~/components/button/IconButton';

const HomeOrder = () => {
	const settings = React.useContext(SettingsContext)
	const setSettings = React.useContext(SetSettingsContext)
	const theme = React.useContext(ThemeContext)

	const moveTop = (index) => () => {
		if (index == 0) return
		const newHomeOrder = [...settings.homeOrder]
		const temp = newHomeOrder[index]
		newHomeOrder[index] = newHomeOrder[index - 1]
		newHomeOrder[index - 1] = temp
		setSettings({ ...settings, homeOrder: newHomeOrder })
	}

	const moveBottom = (index) => () => {
		if (index == settings.homeOrder.length - 1) return
		const newHomeOrder = [...settings.homeOrder]
		const temp = newHomeOrder[index]
		newHomeOrder[index] = newHomeOrder[index + 1]
		newHomeOrder[index + 1] = temp
		setSettings({ ...settings, homeOrder: newHomeOrder })
	}
	const onPressHomeOrder = (index) => () => {
		const newHomeOrder = [...settings.homeOrder]
		newHomeOrder[index].enable = !newHomeOrder[index].enable
		setSettings({ ...settings, homeOrder: newHomeOrder })
	}
	return (
		<>
			{
				settings.homeOrder.map((value, index) => (
					<TouchableOpacity
						key={index}
						style={settingStyles.optionItem(theme, index == settings.homeOrder.length - 1)}
						onPress={onPressHomeOrder(index)}
					>
						<Icon
							name={value.icon}
							size={18}
							color={value.enable ? theme.primaryTouch : theme.secondaryLight}
							style={{ marginEnd: 10 }}
						/>
						<Text key={index} style={{ color: value.enable ? theme.primaryTouch : theme.secondaryLight, flex: 1 }}>{value.title}</Text>
						<IconButton
							icon="angle-up"
							size={30}
							color={theme.primaryLight}
							style={{ paddingHorizontal: 7 }}
							onPress={moveTop(index)}
						/>
						<IconButton
							icon="angle-down"
							size={30}
							color={theme.primaryLight}
							style={{ paddingHorizontal: 7 }}
							onPress={moveBottom(index)}
						/>
					</TouchableOpacity>
				))
			}
		</>
	)
}

export default HomeOrder;