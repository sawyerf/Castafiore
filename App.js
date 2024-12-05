import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TabBar from '~/components/TabBar';
import { HomeStack, SearchStack, PlaylistsStack, SettingsStack } from '~/screens/Stacks';

import { ThemeContext, getTheme } from '~/contexts/theme';
import { ConfigContext, SetConfigContext, getConfig } from '~/contexts/config';
import { getSettings, SettingsContext, SetSettingsContext } from '~/contexts/settings';
import { SongContext, defaultSong, songReducer } from '~/contexts/song';
import * as serviceWorkerRegistration from '~/services/serviceWorkerRegistration';
import { initPlayer, unloadSong } from '~/utils/player';

const Tab = createBottomTabNavigator();

// debug
// window.addEventListener("unhandledrejection", (event) => {
//   console.log(event.reason);
//   fetch(`/lolipop/reject?error=${event.reason}&message=${event.reason.message}&stack=${event.reason.stack}`, {
//     mode: 'no-cors'
//   })
// });

const App = () => {
  const [config, setConfig] = React.useState({});
  const [settings, setSettings] = React.useState({});
  const [song, dispatch] = React.useReducer(songReducer, defaultSong)
  const [theme, setTheme] = React.useState(getTheme())

  React.useEffect(() => {
    if (!song.sound) initPlayer(dispatch)
    getConfig()
      .then((config) => {
        setConfig(config)
      })
    getSettings()
      .then((settings) => {
        setSettings(settings)
      })
  }, [])

  React.useEffect(() => {
    setTheme(getTheme(settings))
  }, [settings.theme])

  const saveSettings = (settings) => {
    setSettings(settings)
    AsyncStorage.setItem('settings', JSON.stringify(settings))
      .catch((error) => {
        console.error('Save settings error:', error)
      })
  }

  return (
    <SetConfigContext.Provider value={setConfig}>
      <SetSettingsContext.Provider value={saveSettings}>
        <SongContext.Provider value={[song, dispatch]}>
          <ConfigContext.Provider value={config}>
            <SettingsContext.Provider value={settings}>
              <ThemeContext.Provider value={theme}>
                <SafeAreaProvider>
                  <NavigationContainer
                    documentTitle={{
                      formatter: (options, route) => {
                        return `Castafiore`
                      }
                    }}
                  >
                    <Tab.Navigator
                      tabBar={(props) => <TabBar {...props} />}
                      screenOptions={{
                        headerShown: false,
                        tabBarPosition: settings.isDesktop ? 'left' : 'bottom',
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
                      <Tab.Screen name="SettingsStack" options={{ title: 'Settings', icon: "gear" }} component={SettingsStack} />
                    </Tab.Navigator>
                  </NavigationContainer>
                </SafeAreaProvider>
              </ThemeContext.Provider>
            </SettingsContext.Provider>
          </ConfigContext.Provider>
        </SongContext.Provider>
      </SetSettingsContext.Provider>
    </SetConfigContext.Provider>
  );
}

serviceWorkerRegistration.register();

export default App;