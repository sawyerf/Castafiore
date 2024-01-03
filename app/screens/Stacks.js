import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import Home from '~/screens/tabs/Home';
import Playlists from '~/screens/tabs/Playlists';
import Search from '~/screens/tabs/Search';

import Album from '~/screens/Album';
import Artist from '~/screens/Artist';
import Favorited from '~/screens/Favorited';
import Playlist from '~/screens/Playlist';

import theme from '~/utils/theme';

const Stack = createNativeStackNavigator();

export const HomeStack = () => {
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
    </Stack.Navigator>
  )
}

export const SearchStack = () => {
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
		</Stack.Navigator>
	)
}