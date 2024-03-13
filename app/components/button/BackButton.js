import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeContext } from '~/contexts/theme';

const BackButton = () => {
	const navigation = useNavigation();
  const theme = React.useContext(ThemeContext)
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