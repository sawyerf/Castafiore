import React from 'react';
import { Text, View, TextInput, Image, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import theme from '~/utils/theme';
import PlayerBox from './PlayerBox';


const TabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View>
      <PlayerBox navigation={navigation} state={state} />
      <View style={{
        flexDirection: 'row',
        backgroundColor: theme.secondaryDark,
        borderTopColor: theme.secondaryDark,
        borderTopWidth: 1,
        paddingBottom: insets.bottom ? insets.bottom : 10,
        paddingTop: 10,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}>
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
            >
              <Icon name={options.icon} size={20} color={isFocused ? theme.primaryTouch : theme.primaryLight} style={{ alignSelf: 'center', marginBottom: 5 }} />
              <Text style={{ color: isFocused ? theme.primaryTouch : theme.primaryLight, textAlign: 'center' }}>
                {options.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = {
}
export default TabBar;