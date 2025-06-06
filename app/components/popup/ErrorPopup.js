import React from 'react';
import { Text, Modal, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeContext } from '~/contexts/theme';
import presStyles from '~/styles/pres';
import size from '~/styles/size';

const ErrorPopup = ({ message, close }) => {
	const insets = useSafeAreaInsets();
	const theme = React.useContext(ThemeContext)
	const [visible, setVisible] = React.useState(false);
	const slide = React.useRef(new Animated.Value(-200)).current;

	React.useEffect(() => {
		if (message) {
			setVisible(true)
			const timeout = setTimeout(() => {
				slide.setValue(-200)
				setVisible(false)
				close()
			}, 3000)
			Animated.timing(slide, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}).start()
			return () => {
				clearTimeout(timeout)
			}
		}
	}, [message])

	return (
		<Modal
			onRequestClose={close}
			transparent={true}
			visible={visible}>
			<Animated.View
				style={{
					margin: 10,
					marginTop: insets.top ? insets.top + 10 : 10,
					paddingVertical: 10,
					paddingHorizontal: 20,
					borderRadius: 20,
					backgroundColor: theme.primaryTouch,
					transform: [{ translateY: slide }],
				}}
			>
				<Text style={{ fontSize: size.text.medium, color: theme.primaryText, fontWeight: 'bold' }}>Error</Text>
				<Text style={[presStyles.text, { color: theme.primaryText }]}>{message}</Text>
			</Animated.View>
		</Modal>
	)
}

export default ErrorPopup;