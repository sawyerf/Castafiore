import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PlayerBox from '../components/PlayerBox';
import theme from '../utils/theme';
import { getConfig } from '../utils/config';


const Explorer = () => {
	const insets = useSafeAreaInsets();

	return (
		<View style={{ flex: 1 }}>
			<ScrollView
				vertical={true}
				style={{
					flex: 1,
					backgroundColor: theme.primaryDark,
					paddingTop: insets.top,
					paddingBottom: insets.bottom + 50,
					paddingLeft: insets.left,
					paddingRight: insets.right,
				}}
				contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
				<Text style={{ color: theme.primaryLight, fontSize: 30, fontWeight: 'bold', marginBottom: 20, marginTop: 30, marginStart: 20 }}>Test</Text>
			</ScrollView>
		</View>
	)
}

const styles = {

}

export default Explorer;