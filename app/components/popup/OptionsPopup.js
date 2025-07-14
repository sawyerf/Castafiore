import React from 'react';
import { View, Text, Modal, ScrollView, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import ImageError from '~/components/ImageError';
import mainStyles from '~/styles/main';
import size from '~/styles/size';

const OptionsPopup = ({ ref, visible, close, options, item = null }) => {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const theme = React.useContext(ThemeContext)
	const slide = React.useRef(new Animated.Value(-1000)).current
	const isAnim = React.useRef(false)
	const config = React.useContext(ConfigContext)
	const navigation = useNavigation();
	const [virtualOptions, setVirtualOptions] = React.useState();

	React.useImperativeHandle(ref, () => ({
		close: close,
		showInfo: (info) => {
			navigation.navigate('Info', { info });
			close();
		},
		setVirtualOptions: (opt) => {
			setVirtualOptions(opt);
		},
		clearVirtualOptions: () => {
			setVirtualOptions(null);
		}
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
						backgroundColor: theme.secondaryBack,
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
								borderColor: theme.secondaryText,
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
								source={{ uri: urlCover(config, item, 100) }}
							/>
							<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
								<Text numberOfLines={1} style={mainStyles.mediumText(theme.primaryText)}>
									{item.track !== undefined ? `${item.track}. ` : null}{item.title || item.name}
								</Text>
								{
									(item.artist || item.homePageUrl) ?
										<Text numberOfLines={1} style={mainStyles.smallText(theme.secondaryText)}>
											{item.artist || item.homePageUrl}
										</Text> : null
								}
							</View>
						</View>
					}
					{[...(virtualOptions || options), {
						name: t('Cancel'),
						icon: 'close',
						onPress: close
					}].map((option, index) => {
						if (!option) return null
						return (
							<Pressable
								style={({ pressed }) => ([mainStyles.opacity({ pressed }), {
									flexDirection: 'row',
									alignItems: 'center',
									paddingHorizontal: 20,
									paddingStart: 20 + 15 * (option.indent || 0),
									height: 45,
									justifyContent: 'flex-start',
									alignContent: 'center',
									gap: 10,
								}])}
								key={index}
								onPress={option.onPress}
							>
								{
									option.icon && (
										<Icon name={option.icon} size={size.icon.tiny} color={theme.secondaryText} style={{
											width: 25,
											textAlign: 'center'
										}} />
									)
								}
								{
									option.image && (
										<ImageError
											style={{
												width: 35,
												height: 35,
												borderRadius: 5,
											}}
											source={{ uri: option.image }}
										/>
									)
								}
								<Text
									style={{ color: theme.primaryText, fontSize: size.text.large }}
									numberOfLines={1}
								>{option.name}</Text>
							</Pressable>
						)
					})}
				</Animated.View>
			</ScrollView>
		</Modal>
	)
}

export default OptionsPopup;