import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeContext } from '~/contexts/theme';
import IconButton from './IconButton';

const BackButton = () => {
	const navigation = useNavigation();
	const theme = React.useContext(ThemeContext)
	const insets = useSafeAreaInsets();

	return (
		<IconButton
			style={{
				position: 'absolute',
				top: insets.top,
				left: insets.left,
				padding: 20,
				zIndex: 2,
			}} onPress={() => navigation.goBack()}
			icon="chevron-left"
			size={23}
			color={theme.primaryLight}
		/>
	);
}

export default BackButton;