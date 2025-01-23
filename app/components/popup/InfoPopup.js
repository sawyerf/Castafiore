import React from 'react';
import { Text, View, Pressable, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeContext } from '~/contexts/theme';
import IconButton from '~/components/button/IconButton';
import settingStyles from '~/styles/settings';
import size from '~/styles/size';
import TableItem from '~/components/settings/TableItem';

const InfoPopup = ({ info, close }) => {
	const insets = useSafeAreaInsets();
	const theme = React.useContext(ThemeContext)

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
					backgroundColor: 'rgba(0,0,0,0.9)',
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
					showsHorizontalScrollIndicator={false}
					showsVerticalScrollIndicator={false}
					style={{
						maxWidth: 800,
						width: '100%',
					}}
					contentContainerStyle={{
						padding: 20,
						marginTop: insets.top,
						marginBottom: insets.bottom,
					}}
				>
					<Text numberOfLines={1}
						style={{
							color: '#fff',
							fontSize: size.text.large,
							fontWeight: 'bold',
							flex: 1,
							textAlign: 'center',
							marginBottom: 50,
						}} > Song Info </Text>
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
					<View style={settingStyles.optionsContainer(theme)}>
						{
							Object.keys(info).map((key, index) => (
								<TableItem
									key={index}
									title={key}
									value={info[key]}
									isLast={index === Object.keys(info).length - 1}
								/>
							))
						}
					</View>
				</ScrollView>
			</View >
		</Modal >
	)
}

export default InfoPopup;