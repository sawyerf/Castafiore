import React from 'react';
import { Text, View, TouchableOpacity, Modal, Dimensions, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import theme from '~/utils/theme';

const OptionsPopup = ({ visible, close, options }) => {
	const insets = useSafeAreaInsets();
	const [paddingTop, setPaddingTop] = React.useState(0)

	React.useEffect(() => {
		const paddingTop = Dimensions.get('window').height - 53 * options.filter(value => value).length - (insets.bottom ? insets.bottom : 20) - 10
		if (paddingTop < 0) {
			setPaddingTop(insets.top ? insets.top + 20 : 20)
		} else {
			setPaddingTop(paddingTop)
		}
	}, [options, insets])

	if (!visible) return null;
	return (
		<Modal
			transparent={true}
			visible={visible}>
			<View
				style={{
					width: '100%',
					height: '100%',
					backgroundColor: 'rgba(0,0,0,0.5)',
					justifyContent: 'flex-end'
				}}
			>
				<ScrollView
					vertical={true}
					style={{
						maxHeight: '100%',
					}}
				>
					<TouchableOpacity
						onPress={() => { close() }}
						style={{
							height: paddingTop,
						}}
					/>
					<View
						style={{
							width: "100%",
							paddingTop: 10,
							paddingBottom: insets.bottom ? insets.bottom : 20,
							backgroundColor: theme.primaryDark,
							borderTopLeftRadius: 20,
							borderTopRightRadius: 20,
						}}
					>
						{options.map((option, index) => (
							<TouchableOpacity
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									paddingHorizontal: 40,
									height: 53,
									justifyContent: 'flex-start',
									alignContent: 'center',
								}}
								key={index}
								onPress={option.onPress}>
								<Icon name={option.icon} size={20} color={theme.primaryLight} style={{
									width: 25,
									textAlign: 'center'
								}} />
								<Text
									style={{ color: theme.primaryLight, fontSize: 20, marginStart: 10 }}
									numberOfLines={1}
								>{option.name}</Text>
							</TouchableOpacity>
						))}
					</View>
				</ScrollView>
			</View>
		</Modal >
	)
}

export default OptionsPopup;