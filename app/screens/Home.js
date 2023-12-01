import React from 'react';
import { Text, View, Button, TextInput } from 'react-native';

const Home = () => {
	React.useEffect(() => {
		console.log('Home mounted');
		const res = fetch(''
		)
	})
	return (
		<View style={{ flex: 1, backgroundColor: '#0e0e0e', alignItems: 'center', justifyContent: 'center' }} >
			<Text style={{ color: 'white' }}>Home</Text>
		</View>
	);
}

export default Home;