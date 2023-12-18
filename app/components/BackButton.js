import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView, Touchable, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import theme from '../utils/theme';
import presStyles from '../styles/pres';
import { SoundContext, playSong } from '../utils/playSong';

const BackButton = () => {
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();

	return (
		<TouchableOpacity style={{
			position: 'absolute',
			top: insets.top,
			left: insets.left,
			padding: 20,
			zIndex: 2,
		}} onPress={() => navigation.goBack()}>
			<Icon name="chevron-left" size={23} color={theme.primaryLight} />
		</TouchableOpacity>
	);
}

export default BackButton;