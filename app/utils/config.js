import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

export const getConfig = async () => {
	const query = await AsyncStorage.getItem('config.query')
	const url = await AsyncStorage.getItem('config.url')
	const username = await AsyncStorage.getItem('config.user')
	return { url, query, username }
}

export const ConfigContext = React.createContext()
export const SetConfigContext = React.createContext()