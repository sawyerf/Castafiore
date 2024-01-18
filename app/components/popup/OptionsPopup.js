import React, { useEffect } from 'react';
import { Text, View, TouchableOpacity, Modal, Dimensions, ScrollView, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import theme from '~/utils/theme';

const OptionsPopup = ({ visible, close, options }) => {
	const insets = useSafeAreaInsets();
	const [paddingTop, setPaddingTop] = React.useState(0)
	const slide = React.useRef(new Animated.Value(0)).current

	useEffect(() => {
		// slide options from bottom
		if (visible) {
			Animated.timing(slide, {
				toValue: 0,
				duration: 100,
				useNativeDriver: true
			}).start()
		} else {
			slide.setValue(getSizeOptions())
		}
	}, [visible])

	const getSizeOptions = () => {
		const lenghtOptions = options.filter(value => value).length
		return 53 * lenghtOptions + (insets.bottom ? insets.bottom : 20) + 10
	}

	React.useEffect(() => {
		const sizeOptions = getSizeOptions()
		if (!visible) slide.setValue(sizeOptions)
		const paddingTop = Dimensions.get('window').height - sizeOptions
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
			onRequestClose={close}
			visible={visible}>
			<ScrollView
				vertical={true}
				style={{
					width: '100%',
					height: '100%',
					backgroundColor: 'rgba(0,0,0,0.5)',
				}}
			>
				<TouchableOpacity
					onPress={close}
					style={{
						height: paddingTop,
					}}
				/>
				<Animated.View
					style={{
						width: "100%",
						paddingTop: 10,
						paddingBottom: insets.bottom ? insets.bottom : 20,
						backgroundColor: theme.primaryDark,
						borderTopLeftRadius: 20,
						borderTopRightRadius: 20,
						transform: [{
							translateY: slide
						}]
					}}
				>
					{options.map((option, index) => (
						<TouchableOpacity
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								paddingHorizontal: 25,
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
				</Animated.View>
			</ScrollView>
		</Modal >
	)
}

export default OptionsPopup;