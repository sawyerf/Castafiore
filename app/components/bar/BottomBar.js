import React from 'react';
import { Text, View, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfigContext } from '~/contexts/config';

import { ThemeContext } from '~/contexts/theme';

const BottomBar = ({ state, descriptors, navigation }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)

	return (
		<View style={{
			flexDirection: 'row',
			backgroundColor: theme.secondaryDark,
			borderTopColor: theme.secondaryDark,
			borderTopWidth: 1,
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
					<Pressable
						onPress={onPress}
						onLongPress={onLongPress}
						style={({ pressed }) => ({
							flex: 1,
							paddingBottom: insets.bottom ? insets.bottom : 10,
							paddingTop: 10,
							opacity: pressed ? 0.5 : 1,
						})}
						key={index}
						disabled={(!config.query && route.name !== 'Settings')}
					>
						<Icon name={options.icon} size={20} color={getColor()} style={{ alignSelf: 'center', marginBottom: 5 }} />
						<Text style={{ color: getColor(), textAlign: 'center' }}>
							{options.title}
						</Text>
					</Pressable>
				);
			})}
		</View>
	)
}


export default BottomBar;