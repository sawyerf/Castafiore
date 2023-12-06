import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import React from 'react';

import Settings from './app/screens/Settings';
import Home from './app/screens/Home';
import Playlists from './app/screens/Playlists';
import theme from './app/utils/theme';
import Explorer from './app/screens/Explorer';
import Search from './app/screens/Search';
import Album from './app/screens/Album';
import { SoundContext } from './app/utils/playSong';
import PlayerBox from './app/components/PlayerBox';
import TabBar from './app/components/TabBar';

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
    </Stack.Navigator>
  )
}

const App = () => {
  return (
    <SoundContext.Provider value={new Audio.Sound()}>
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
              <Tab.Screen name="Explorer" options={{ title: 'Explorer', icon: "compass" }} component={Explorer} />
              <Tab.Screen name="Search" options={{ title: 'Search', icon: "search" }} component={Search} />
              <Tab.Screen name="Playlists" options={{ title: 'Playlists', icon: "book" }} component={Playlists} />
              <Tab.Screen name="Settings" options={{ title: 'Settings', icon: "gear" }} component={Settings} />
            </Tab.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
    </SoundContext.Provider>
  );
}
export default App;