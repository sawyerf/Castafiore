import React from 'react';
import { Text, View, TextInput, Image, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import { SoundContext, nextSong, previousSong } from '~/utils/playSong';
import theme from '~/utils/theme';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import { ConfigContext } from '~/utils/config';
import { urlCover, getApi } from '~/utils/api';
import FavoritedButton from './button/FavoritedButton';
import IconButton from './button/IconButton';

const OptionsPopup = ({ visible, options }) => {
	if (!visible) return null;
	return (
		<View style={{
			width: "100%",
			// height: 100,
			marginBottom: 10,
			// backgroundColor: theme.primaryTouch,
			backgroundColor: theme.primaryDark,
			zIndex: 1,
		}}>
			{options.map((option, index) => (
				<TouchableOpacity
					style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 15 }}
					key={index}
					onPress={option.onPress}>
					<Icon name={option.icon} size={20} color={theme.primaryLight} />
					<Text style={{ color: theme.primaryLight, fontSize: 20, marginStart: 10 }}>{option.name}</Text>
				</TouchableOpacity>
			))}
		</View>
	)
}

export default OptionsPopup;