import React from 'react';
import { Text, View, Pressable, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import Player from '~/utils/player';
import pkg from '~/../package.json';
import size from '~/styles/size';
import mainStyles from '~/styles/main';

const SideBar = ({ state, descriptors, navigation }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)

	return (
		<View style={{
			flexDirection: 'column',
			backgroundColor: theme.secondaryDark,
			borderTopColor: theme.secondaryDark,
			borderTopWidth: 1,
			height: '100%',
			width: 250,
			paddingLeft: insets.left,
			paddingRight: insets.right,
			borderEndWidth: 1,
			borderEndColor: theme.tertiaryDark,
		}}
		>
			<View style={{ marginHorizontal: 10, marginTop: 15, marginBottom: 15 }} >
				<Pressable
					onPress={Player.tuktuktuk}
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						width: '100%',
					}}>
					<Image
						source={require('~/../assets/icon.png')}
						style={mainStyles.icon}
					/>
					<View style={{ flexDirection: 'column', justifyContent: 'center' }}>
						<Text style={{ color: theme.primaryLight, fontSize: size.text.large, marginBottom: 0 }}>Castafiore</Text>
						<Text style={{ color: theme.secondaryLight, fontSize: size.text.small }}>Version {pkg.version}</Text>
					</View>
				</Pressable>
			</View>
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
						style={({ pressed }) => ([mainStyles.opacity({ pressed }), {
							flexDirection: 'row',
							alignItems: 'center',
							backgroundColor: isFocused ? theme.primaryDark : undefined,
							marginHorizontal: 10,
							paddingVertical: 4,
							paddingLeft: 10,
							borderRadius: 8,
							marginBottom: 3,
						}])}
						key={index}
						disabled={(!config.query && route.name !== 'Settings')}
					>
						<Icon name={options.icon} size={26} color={getColor()} style={{ marginRight: 10 }} />
						<Text style={{ color: getColor(), textAlign: 'left', fontSize: size.text.large, fontWeight: '600' }}>
							{options.title}
						</Text>
					</Pressable>
				);
			})}
		</View>
	)
}

export default SideBar;