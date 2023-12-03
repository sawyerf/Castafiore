import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Settings from './app/screens/Settings';
import Home from './app/screens/Home';
import Playlists from './app/screens/Playlists';
import theme from './app/utils/theme';
import Explorer from './app/screens/Explorer';
import Search from './app/screens/Search';
import Album from './app/screens/Album';

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
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: theme.secondaryDark,
              borderTopColor: theme.secondaryDark,
              tabBarActiveTintColor: theme.primaryTouch,
            }
          }}
        >
          <Tab.Screen name="HomeStack" component={HomeStack} />
          <Tab.Screen name="Explorer" component={Explorer} />
          <Tab.Screen name="Search" component={Search} />
          <Tab.Screen name="Playlists" component={Playlists} />
          <Tab.Screen name="Settings" component={Settings} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
export default App;