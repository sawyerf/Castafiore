import React from 'react';
import { Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import IconButton from '~/components/button/IconButton';
import theme from '~/utils/theme';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';

const InfoPopup = ({ songInfo, close }) => {
	const insets = useSafeAreaInsets();

	if (!songInfo) return null;
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
					<Text style={{ ...presStyles.title, marginBottom: 20 }}>Song Info</Text>
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
						Object.keys(songInfo).map((key, index) => (
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
								<Text style={{ color: theme.primaryLight, fontSize: 16, flex: 1 }}>{key}</Text>
								<Text style={{ color: theme.secondaryLight, fontSize: 16, flex: 2 }}>{songInfo[key].toString()}</Text>
							</View>
						))
					}
				</ScrollView>
			</View>
		</Modal >
	)
}

export default InfoPopup;