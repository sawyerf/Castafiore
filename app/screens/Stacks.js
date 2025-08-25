import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '~/screens/tabs/Home';
import Playlists from '~/screens/tabs/Playlists';
import Search from '~/screens/tabs/Search';
import Settings from '~/screens/tabs/Settings';

import Album from '~/screens/Pres/Album';
import Artist from '~/screens/Pres/Artist';
import ArtistAlbums from '~/screens/Pres/ArtistAlbums';
import Favorited from '~/screens/Pres/Favorited';
import Genre from '~/screens/Pres/Genre';
import Playlist from '~/screens/Pres/Playlist';
import Songs from '~/screens/Pres/Songs';

import EditPlaylist from '~/screens/EditPlaylist';
import UpdateRadio from '~/screens/UpdateRadio';

import AlbumExplorer from '~/screens/Explorer/AlbumExplorer';
import ArtistExplorer from '~/screens/Explorer/ArtistExplorer';
import SongExplorer from '~/screens/Explorer/SongExplorer';
import FreshReleases from '~/screens/FreshReleases';
import Info from '~/screens/Info';
import ShowAll from '~/screens/ShowAll';

import AddServer from '~/screens/Settings/AddServer';
import CacheSettings from '~/screens/Settings/Cache';
import Connect from '~/screens/Settings/Connect';
import HomeSettings from '~/screens/Settings/Home';
import InformationsSettings from '~/screens/Settings/Informations';
import LanguageSettings from '~/screens/Settings/Language';
import LogsSettings from '~/screens/Settings/Logs';
import PlayerSettings from '~/screens/Settings/Player';
import PlaylistsSettings from '~/screens/Settings/Playlists';
import SharesSettings from '~/screens/Settings/Shares';
import ThemeSettings from '~/screens/Settings/Theme';

import { ThemeContext } from '~/contexts/theme';

const Stack = createNativeStackNavigator();

export const HomeStack = () => {
	const theme = React.useContext(ThemeContext)

	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: theme.secondaryBack,
					borderTopColor: theme.secondaryBack,
					tabBarActiveTintColor: theme.primaryTouch,
				}
			}}
		>
			<Stack.Screen name="Home" component={Home} />
			<Stack.Screen name="Album" component={Album} />
			<Stack.Screen name="Artist" component={Artist} />
			<Stack.Screen name="ArtistAlbums" component={ArtistAlbums} />
			<Stack.Screen name="Songs" component={Songs} />
			<Stack.Screen name="Genre" component={Genre} />
			<Stack.Screen name="UpdateRadio" component={UpdateRadio} />
			<Stack.Screen name="ShowAll" component={ShowAll} />
			<Stack.Screen name="Playlist" component={Playlist} />
			<Stack.Screen name="Info" component={Info} />
			<Stack.Screen name="FreshReleases" component={FreshReleases} />
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
					backgroundColor: theme.secondaryBack,
					borderTopColor: theme.secondaryBack,
					tabBarActiveTintColor: theme.primaryTouch,
				}
			}}
		>
			<Stack.Screen name="Search" component={Search} />
			<Stack.Screen name="Album" component={Album} />
			<Stack.Screen name="Artist" component={Artist} />
			<Stack.Screen name="ArtistAlbums" component={ArtistAlbums} />
			<Stack.Screen name="Songs" component={Songs} />
			<Stack.Screen name="ArtistExplorer" component={ArtistExplorer} />
			<Stack.Screen name="AlbumExplorer" component={AlbumExplorer} />
			<Stack.Screen name="SongExplorer" component={SongExplorer} />
			<Stack.Screen name="Info" component={Info} />
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
					backgroundColor: theme.secondaryBack,
					borderTopColor: theme.secondaryBack,
					tabBarActiveTintColor: theme.primaryTouch,
				}
			}}
		>
			<Stack.Screen name="Playlists" component={Playlists} />
			<Stack.Screen name="Playlist" component={Playlist} />
			<Stack.Screen name="Favorited" component={Favorited} />
			<Stack.Screen name="Album" component={Album} />
			<Stack.Screen name="Artist" component={Artist} />
			<Stack.Screen name="ArtistAlbums" component={ArtistAlbums} />
			<Stack.Screen name="Songs" component={Songs} />
			<Stack.Screen name="EditPlaylist" component={EditPlaylist} />
			<Stack.Screen name="Info" component={Info} />
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
					backgroundColor: theme.secondaryBack,
					borderTopColor: theme.secondaryBack,
					tabBarActiveTintColor: theme.primaryTouch,
				}
			}}
		>
			<Stack.Screen name="Settings" component={Settings} />
			<Stack.Screen name="Connect" component={Connect} />
			<Stack.Screen name="Settings/AddServer" component={AddServer} />
			<Stack.Screen name="Settings/Home" component={HomeSettings} />
			<Stack.Screen name="Settings/Playlists" component={PlaylistsSettings} />
			<Stack.Screen name="Settings/Cache" component={CacheSettings} />
			<Stack.Screen name="Settings/Theme" component={ThemeSettings} />
			<Stack.Screen name="Settings/Informations" component={InformationsSettings} />
			<Stack.Screen name="Settings/Player" component={PlayerSettings} />
			<Stack.Screen name="Settings/Shares" component={SharesSettings} />
			<Stack.Screen name="Settings/Language" component={LanguageSettings} />
			<Stack.Screen name="Settings/Logs" component={LogsSettings} />
		</Stack.Navigator>
	)
}