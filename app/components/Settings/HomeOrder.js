import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import React from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsContext, SetSettingsContext } from '~/contexts/settings';
import theme from '~/utils/theme';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import IconButton from '~/components/button/IconButton';

const HomeOrder = ({ }) => {
	const settings = React.useContext(SettingsContext)
	const setSettings = React.useContext(SetSettingsContext)

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
			<Text style={{ ...presStyles.title, fontSize: 20, marginBottom: 20 }}> Home Page</Text >
			{
				settings.homeOrder.map((value, index) => (
					<TouchableOpacity
						key={index}
						style={{
							flexDirection: 'row',
							paddingVertical: 11,
							paddingStart: 20,
							paddingEnd: 14,
							marginBottom: 10,
							backgroundColor: theme.secondaryDark,
							justifyContent: 'center',
							alignItems: 'center',
							borderRadius: 10,
							width: '100%',
						}}
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
							icon="chevron-up"
							size={25}
							color={theme.primaryLight}
							style={{ paddingHorizontal: 5 }}
							onPress={moveTop(index)}
						/>
						<IconButton
							icon="chevron-down"
							size={25}
							color={theme.primaryLight}
							style={{ paddingHorizontal: 5 }}
							onPress={moveBottom(index)}
						/>
					</TouchableOpacity>
				))
			}
		</>
	)
}

export default HomeOrder;