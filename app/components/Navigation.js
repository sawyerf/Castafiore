import React from 'react'
import { SystemBars } from 'react-native-edge-to-edge'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { HomeStack, SearchStack, PlaylistsStack, SettingsStack } from '~/screens/Stacks'
import { useSettings } from '~/contexts/settings'
import { useTheme } from '~/contexts/theme'
import TabBar from '~/components/bar/TabBar'

const Tab = createBottomTabNavigator()

const Navigation = () => {
	const theme = useTheme()
	const settings = useSettings()

	return (
		<NavigationContainer
			documentTitle={{
				formatter: () => {
					return `Castafiore`
				}
			}}
		>
			<SystemBars style={theme.barStyle} />
			<Tab.Navigator
				tabBar={(props) => <TabBar {...props} />}
				screenOptions={{
					headerShown: false,
					navigationBarColor: theme.primaryBack,
					tabBarPosition: settings.isDesktop ? 'left' : 'bottom',
					tabBarStyle: {
						backgroundColor: theme.secondaryBack,
						borderTopColor: theme.secondaryBack,
						tabBarActiveTintColor: theme.primaryTouch,
					}
				}}
			>
				<Tab.Screen name="HomeStack" options={{ title: 'Home', icon: "home" }} component={HomeStack} />
				<Tab.Screen name="SearchStack" options={{ title: 'Search', icon: "search" }} component={SearchStack} />
				<Tab.Screen name="PlaylistsStack" options={{ title: 'Playlists', icon: "book" }} component={PlaylistsStack} />
				<Tab.Screen name="SettingsStack" options={{ title: 'Settings', icon: "gear" }} component={SettingsStack} />
			</Tab.Navigator>
		</NavigationContainer>
	)
}

export default Navigation