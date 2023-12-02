import AsyncStorage from '@react-native-async-storage/async-storage';

export const getConfig = async () => {
	const query = await AsyncStorage.getItem('config.query')
	const configUrl = await AsyncStorage.getItem('config.url')
	return { url: configUrl, query: query }
}