import React from 'react';
import { Text, View, Pressable, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import IconButton from '~/components/button/IconButton';
import { ThemeContext } from '~/contexts/theme';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';

const InfoPopup = ({ info, close }) => {
	const insets = useSafeAreaInsets();
  const theme = React.useContext(ThemeContext)

	const objectToString = (obj) => {
		if (typeof obj === 'object') {
			if (obj instanceof Array) {
				return obj.map(value => objectToString(value)).join(', ')
			} else {
				return Object.keys(obj).map(key => `${key}: ${objectToString(obj[key])}`).join('\n')
			}
		} else if (typeof obj === 'boolean') {
			return obj ? 'True' : 'False'
		} else {
			return obj
		}
	}

	if (!info) return null;
	return (
		<Modal
			onRequestClose={close}
			transparent={true}
			visible={true}>
			<View
				style={{
					width: '100%',
					height: '100%',
					backgroundColor: 'rgba(0,0,0,0.5)',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Pressable
					onPress={close}
					style={{
						width: '100%',
						height: '100%',
						position: 'absolute',
						top: 0,
					}}
				/>
				<ScrollView
					style={{
						marginTop: insets.top ? insets.top + 20 : 20,
						marginBottom: (insets.bottom ? insets.bottom : 20) + 63,
						marginStart: 20,
						marginEnd: 20,
						borderRadius: 20,
						backgroundColor: theme.primaryDark,
						maxWidth: 1000,
						width: '90%',
					}}
					contentContainerStyle={{
						padding: 20,
					}}
				>
					<Text style={{ ...presStyles.title(theme), marginBottom: 20 }}>Song Info</Text>
					<IconButton
						icon="close"
						onPress={close}
						style={{
							position: 'absolute',
							top: 10,
							end: 10,
							padding: 10,
						}}
					/>
					{
						Object.keys(info).map((key, index) => (
							<View
								key={index}
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									padding: 10,
									paddingStart: 20,
									paddingEnd: 20,
									borderBottomWidth: 1,
									borderBottomColor: theme.primaryLight,
								}}
							>
								<Text style={{ color: theme.primaryLight, fontSize: 14, flex: 1, minWidth: 100 }}>{key}</Text>
								<Text style={{ color: theme.secondaryLight, fontSize: 14, flex: 5 }}>{objectToString(info[key])}</Text>
							</View>
						))
					}
				</ScrollView>
			</View>
		</Modal >
	)
}

export default InfoPopup;