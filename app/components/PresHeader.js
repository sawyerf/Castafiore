import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { ThemeContext } from '~/contexts/theme';

import BackButton from '~/components/button/BackButton';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import ImageError from '~/components/ImageError';

const PresHeader = ({ title, subTitle, imgSrc, onPressTitle = null, children = null }) => {
	const theme = React.useContext(ThemeContext);

	return (
		<>
			<BackButton />
			<ImageError
				style={[presStyles.cover, { backgroundColor: theme.secondaryBack }]}
				source={{ uri: imgSrc }}
			/>
			<View style={presStyles.headerContainer}>
				<View style={{ flex: 1 }}>
					<Text style={presStyles.title(theme)} numberOfLines={2}>{title}</Text>
					<Pressable
						style={mainStyles.opacity}
						onPress={onPressTitle}
						disabled={!onPressTitle}
					>
						<Text style={presStyles.subTitle(theme)}>{subTitle}</Text>
					</Pressable>
				</View>
				{children}
			</View>
		</>
	)
}

export default PresHeader;