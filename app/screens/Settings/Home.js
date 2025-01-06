import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsContext, SetSettingsContext } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import ButtonSwitch from '~/components/settings/ButtonSwitch';
import Header from '~/components/Header';
import HomeOrder from '~/components/settings/HomeOrder';
import OptionInput from '~/components/settings/OptionInput';
import mainStyles from '~/styles/main';
import settingStyles from '~/styles/settings';

const HomeSettings = () => {
	const insets = useSafeAreaInsets()
	const theme = React.useContext(ThemeContext)
	const settings = React.useContext(SettingsContext)
	const setSettings = React.useContext(SetSettingsContext)
	const [sizeOfList, setSizeOfList] = React.useState(settings.sizeOfList.toString())
	const [LBUser, setLBUser] = React.useState(settings.listenBrainzUser)

	React.useEffect(() => {
		setSizeOfList(settings.sizeOfList.toString())
	}, [settings.sizeOfList])

	React.useEffect(() => {
		if (sizeOfList === '') return
		const number = parseInt(sizeOfList)
		if (number != settings.sizeOfList) setSettings({ ...settings, sizeOfList: number })
	}, [sizeOfList])

	React.useEffect(() => {
		if (LBUser != settings.listenBrainzUser) setSettings({ ...settings, listenBrainzUser: LBUser })
	}, [LBUser])

	return (
		<ScrollView
			style={mainStyles.mainContainer(insets, theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<Header title="Home" />
			<View
				style={[settingStyles.contentMainContainer, { marginTop: 30 }]}
			>
				<Text style={settingStyles.titleContainer(theme)}> Home Page</Text >
				<View style={[settingStyles.optionsContainer(theme), { marginBottom: 5 }]}>
					<HomeOrder />
				</View>
				<Text style={settingStyles.description(theme)}>	{'Select what you want to see on the home page'}</Text >
				<View style={settingStyles.optionsContainer(theme)}>
					<OptionInput
						title="Size of album list"
						value={sizeOfList}
						onChangeText={(text) => setSizeOfList(text.replace(/[^0-9]/g, ''))}
						inputMode="numeric"
						isLast={true}
					/>
				</View>

				<Text style={settingStyles.titleContainer(theme)}>Scroll</Text>
				<View style={[settingStyles.optionsContainer(theme), { marginBottom: 5 }]}>
					<ButtonSwitch
						title={'Show scroll helper'}
						onPress={() => setSettings({ ...settings, scrollHelper: !settings.scrollHelper })}
						value={settings.scrollHelper}
						isLast={true}
					/>
				</View>
				<Text style={settingStyles.description(theme)}>	{'It\'s recommanded to activate scroll helper on desktop'}</Text >

				<View style={settingStyles.optionsContainer(theme)}>
					<OptionInput
						title="ListenBrainz User"
						value={LBUser}
						onChangeText={(text) => setLBUser(text)}
						placeholder="user"
						isLast={true}
					/>
				</View>
			</View>
		</ScrollView>
	)
}

export default HomeSettings;