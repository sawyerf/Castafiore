import React from 'react';
import { View, Text, Modal, ScrollView, Animated, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import ImageError from '~/components/ImageError';
import InfoPopup from '~/components/popup/InfoPopup';
import mainStyles from '~/styles/main';
import size from '~/styles/size';

const OptionsPopup = ({ reff, visible, close, options, item = null }) => {
	const insets = useSafeAreaInsets();
	const theme = React.useContext(ThemeContext)
	const slide = React.useRef(new Animated.Value(-1000)).current
	const isAnim = React.useRef(false)
	const config = React.useContext(ConfigContext)
	const [info, setInfo] = React.useState(null)

	React.useImperativeHandle(reff, () => ({
		close: close,
		setInfo: setInfo,
	}), [close])

	React.useEffect(() => {
		if (!visible) slide.setValue(-10000)
		isAnim.current = true
	}, [visible])

	const onLayout = (event) => {
		if (!isAnim.current) return
		isAnim.current = false
		slide.setValue(event.nativeEvent.layout.height)
		Animated.timing(slide, {
			toValue: 0,
			duration: 100,
			useNativeDriver: true
		}).start()
	}

	if (info) return (
		<InfoPopup info={info} close={() => setInfo(null)} />
	)
	if (!visible) return null;
	return (
		<Modal
			transparent={true}
			onRequestClose={close}
			statusBarTranslucent={true}
			visible={visible}>
			<ScrollView
				vertical={true}
				style={{
					width: '100%',
					height: '100%',
					backgroundColor: 'rgba(0,0,0,0.5)',
				}}
				contentContainerStyle={{
					justifyContent: 'flex-end',
					minHeight: '100%',
				}}
			>
				<Pressable
					onPress={close}
					style={{
						width: '100%',
						minHeight: insets.top + 100,
						flex: 1,
					}}
				/>
				<Animated.View
					onLayout={onLayout}
					style={{
						width: "100%",
						paddingTop: 15,
						paddingBottom: insets.bottom > 15 ? insets.bottom : 15,
						backgroundColor: theme.secondaryDark,
						borderTopLeftRadius: 20,
						borderTopRightRadius: 20,
						transform: [{ translateY: slide }]
					}}
				>
					{
						item &&
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'start',
								alignItems: 'center',
								marginHorizontal: 20,
								marginBottom: 10,
								marginTop: 5,
								borderColor: theme.secondaryLight,
								borderBottomWidth: 1,
								paddingBottom: 15,
							}}
						>
							<ImageError
								style={{
									width: 50,
									height: 50,
									marginRight: 10,
									borderRadius: 5,
								}}
								source={{ uri: urlCover(config, item.albumId || item.id, 100) }}
							/>
							<View style={{ flex: 1, flexDirection: 'column' }}>
								<Text numberOfLines={1} style={{ color: theme.primaryLight, fontSize: size.text.medium, marginBottom: 2 }}>
									{item.track !== undefined ? `${item.track}. ` : null}{item.title || item.name}
								</Text>
								<Text numberOfLines={1} style={{ color: theme.secondaryLight, fontSize: size.text.small }}>
									{item.artist || item.homePageUrl}
								</Text>
							</View>
						</View>
					}
					{[
						...options,
						{
							name: 'Cancel',
							icon: 'close',
							onPress: close
						}
					].map((option, index) => {
						if (!option) return null
						return (
							<Pressable
								style={({ pressed }) => ([mainStyles.opacity({ pressed }), {
									flexDirection: 'row',
									alignItems: 'center',
									paddingHorizontal: 20,
									height: 45,
									justifyContent: 'flex-start',
									alignContent: 'center',
								}])}
								key={index}
								onPress={option.onPress}>
								<Icon name={option.icon} size={size.icon.tiny} color={theme.secondaryLight} style={{
									padding: 15 * (option.indent || 0),
									width: 25,
									textAlign: 'center'
								}} />
								<Text
									style={{ color: theme.primaryLight, fontSize: size.text.large, marginStart: 10 }}
									numberOfLines={1}
								>{option.name}</Text>
							</Pressable>
						)
					})}
				</Animated.View>
			</ScrollView>
		</Modal >
	)
}

export default OptionsPopup;