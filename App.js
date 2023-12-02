import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SetServer from './app/screens/SetServer';
import Home from './app/screens/Home';
import Playlists from './app/screens/Playlists';
import theme from './app/utils/theme';

const Tab = createBottomTabNavigator();

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
            }
          }}
        >
          <Tab.Screen name="SetServer" component={SetServer} />
          <Tab.Screen name="Home" component={Home} />
          <Tab.Screen name="Playlists" component={Playlists} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
export default App;