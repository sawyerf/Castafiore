import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfigContext } from '~/utils/config';

import theme from '~/utils/theme';
import Player from '~/components/player/Player';

const TabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const config = React.useContext(ConfigContext)
  const [isFullScreen, setIsFullScreen] = React.useState(false)

  React.useEffect(() => {
    if (config.query === null) {
      navigation.navigate('Settings')
    }
  }, [config.query])

  return (
    <View>
      <Player navigation={navigation} state={state} fullscreen={{ value: isFullScreen, set: setIsFullScreen }} />
      {!isFullScreen && <View style={{
        flexDirection: 'row',
        backgroundColor: theme.secondaryDark,
        borderTopColor: theme.secondaryDark,
        borderTopWidth: 1,
        paddingBottom: insets.bottom ? insets.bottom : 10,
        paddingTop: 10,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const getColor = () => {
            if (isFocused) return theme.primaryTouch
            if (!config.query && route.name !== 'Settings') return theme.secondaryLight
            return theme.primaryLight
          }

          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{ flex: 1 }}
              key={index}
              disabled={(!config.query && route.name !== 'Settings')}
            >
              <Icon name={options.icon} size={20} color={getColor()} style={{ alignSelf: 'center', marginBottom: 5 }} />
              <Text style={{ color: getColor(), textAlign: 'center' }}>
                {options.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View> }
    </View>
  );
}

const styles = {
}
export default TabBar;