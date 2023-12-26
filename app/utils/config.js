import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

export const getConfig = async () => {
	const config = await AsyncStorage.getItem('config')
	if (config === null) return {url: null, username: null, query: null}
	return JSON.parse(config)
}

export const ConfigContext = React.createContext()
export const SetConfigContext = React.createContext()