import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import React from 'react';

import Home from './app/screens/tabs/Home';
import Playlists from './app/screens/tabs/Playlists';
import Search from './app/screens/tabs/Search';
import Settings from './app/screens/tabs/Settings';

import Album from './app/screens/Album';
import Artist from './app/screens/Artist';
import Favorited from './app/screens/Favorited';
import Playlist from './app/screens/Playlist';

import TabBar from './app/components/TabBar';

import theme from './app/utils/theme';
import { SoundContext } from './app/utils/playSong';
import { ConfigContext, SetConfigContext, getConfig } from './app/utils/config';
import * as serviceWorkerRegistration from './app/services/serviceWorkerRegistration';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => {
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

const SearchStack = () => {
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
const PlaylistsStack = () => {
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

const App = () => {
  const [config, setConfig] = React.useState({});

  React.useEffect(() => {
    getConfig()
      .then((config) => {
        setConfig(config)
      })
  }, [])

  return (
    <SoundContext.Provider value={new Audio.Sound()}>
      <SetConfigContext.Provider value={setConfig}>
        <ConfigContext.Provider value={config}>
          <SafeAreaProvider>
            <NavigationContainer>
              <Tab.Navigator
                tabBar={(props) => <TabBar {...props} />}
                screenOptions={{
                  headerShown: false,
                  tabBarStyle: {
                    backgroundColor: theme.secondaryDark,
                    borderTopColor: theme.secondaryDark,
                    tabBarActiveTintColor: theme.primaryTouch,
                  }
                }}
              >
                <Tab.Screen name="HomeStack" options={{ title: 'Home', icon: "home" }} component={HomeStack} />
                {/* <Tab.Screen name="Explorer" options={{ title: 'Explorer', icon: "compass" }} component={Explorer} /> */}
                <Tab.Screen name="SearchStack" options={{ title: 'Search', icon: "search" }} component={SearchStack} />
                <Tab.Screen name="PlaylistsStack" options={{ title: 'Playlists', icon: "book" }} component={PlaylistsStack} />
                <Tab.Screen name="Settings" options={{ title: 'Settings', icon: "gear" }} component={Settings} />
              </Tab.Navigator>
            </NavigationContainer>
          </SafeAreaProvider>
        </ConfigContext.Provider>
      </SetConfigContext.Provider>
    </SoundContext.Provider>
  );
}

serviceWorkerRegistration.register();

export default App;