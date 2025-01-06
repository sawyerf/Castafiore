import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '~/screens/tabs/Home';
import Playlists from '~/screens/tabs/Playlists';
import Search from '~/screens/tabs/Search';
import Settings from '~/screens/tabs/Settings';

import Album from '~/screens/Album';
import Artist from '~/screens/Artist';
import Favorited from '~/screens/Favorited';
import Genre from '~/screens/Genre';
import Playlist from '~/screens/Playlist';
import UpdateRadio from '~/screens/UpdateRadio';
import Connect from '~/screens/Settings/Connect';
import HomeSettings from '~/screens/Settings/Home';
import PlaylistsSettings from '~/screens/Settings/Playlists';
import CacheSettings from '~/screens/Settings/Cache';
import ThemeSettings from '~/screens/Settings/Theme';
import ShowAll from '~/screens/ShowAll';

import { ThemeContext } from '~/contexts/theme';

const Stack = createNativeStackNavigator();

export const HomeStack = () => {
	const theme = React.useContext(ThemeContext)

	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: theme.secondaryDark,
					borderTopColor: theme.secondaryDark,
					tabBarActiveTintColor: theme.primaryTouch,
				}
			}}
		>
			<Stack.Screen name="Home" component={Home} />
			<Stack.Screen name="Album" component={Album} />
			<Stack.Screen name="Artist" component={Artist} />
			<Stack.Screen name="Genre" component={Genre} />
			<Stack.Screen name="UpdateRadio" component={UpdateRadio} />
			<Stack.Screen name="ShowAll" component={ShowAll} />
		</Stack.Navigator>
	)
}

export const SearchStack = () => {
	const theme = React.useContext(ThemeContext)

	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: theme.secondaryDark,
					borderTopColor: theme.secondaryDark,
					tabBarActiveTintColor: theme.primaryTouch,
				}
			}}
		>
			<Stack.Screen name="Search" component={Search} />
			<Stack.Screen name="Album" component={Album} />
			<Stack.Screen name="Artist" component={Artist} />
		</Stack.Navigator>
	)
}

export const PlaylistsStack = () => {
	const theme = React.useContext(ThemeContext)

	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: theme.secondaryDark,
					borderTopColor: theme.secondaryDark,
					tabBarActiveTintColor: theme.primaryTouch,
				}
			}}
		>
			<Stack.Screen name="Playlists" component={Playlists} />
			<Stack.Screen name="Playlist" component={Playlist} />
			<Stack.Screen name="Favorited" component={Favorited} />
			<Stack.Screen name="Album" component={Album} />
			<Stack.Screen name="Artist" component={Artist} />
		</Stack.Navigator>
	)
}

export const SettingsStack = () => {
	const theme = React.useContext(ThemeContext)

	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: theme.secondaryDark,
					borderTopColor: theme.secondaryDark,
					tabBarActiveTintColor: theme.primaryTouch,
				}
			}}
		>
			<Stack.Screen name="Settings" component={Settings} />
			<Stack.Screen name="Connect" component={Connect} />
			<Stack.Screen name="Settings/Home" component={HomeSettings} />
			<Stack.Screen name="Settings/Playlists" component={PlaylistsSettings} />
			<Stack.Screen name="Settings/Cache" component={CacheSettings} />
			<Stack.Screen name="Settings/Theme" component={ThemeSettings} />
		</Stack.Navigator>
	)
}