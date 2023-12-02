import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../utils/theme';

const PlayerBox = () => {
	const insets = useSafeAreaInsets();

	return (
		<View style={{
			position: 'absolute',
			bottom: 0,
			left: 0,

			flexDirection: 'row',
			backgroundColor: theme.secondaryDark,
			padding: 10,
			margin: 10,
			borderRadius: 10,
		}}>
			<View style={styles.boxPlayerImage}>
				<Image
					style={styles.boxPlayerImage}
					source={{
						uri: 'https://i.scdn.co/image/ab67616d0000b2736d59695e16cdf5e16d423e63',
					}}
				/>
			</View>
			<View style={styles.boxPlayerText}>
				<Text style={{ color: theme.primaryLight, flex: 1 }} numberOfLines={1}>Song Title</Text>
				<Text style={{ color: theme.secondaryLight, flex: 1 }} numberOfLines={1}>Artist</Text>
			</View>
			<View style={styles.boxPlayerButton}>
				<Button
					color={theme.primaryTouch}
					title={'N'}>
				</Button>
				<Button
					color={theme.primaryTouch}
					title={'P'}>
				</Button>
			</View>
		</View>
	)
}

const styles = {
	boxPlayer: {
	},
	boxPlayerImage: {
		flex: 0,
		height: 40,
		width: 40,
		marginRight: 10,
		borderRadius: 4,
	},
	boxPlayerText: {
		flex: 1,
	},
	boxPlayerButton: {
		flex: 0,
		flexDirection: 'row',
	},

}

export default PlayerBox;