import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system'

export const getCache = async (_cacheName, _key) => {
	return null
}

export const clearCache = async () => {
	return null
}

export const getStatCache = async () => {
	return null
}

export const getJsonCache = async (_cacheName, key) => {
	const json = await AsyncStorage.getItem(key)
	return json ? JSON.parse(json) : null
}

export const setJsonCache = async (_cacheName, key, json) => {
	if (!json) return
	await AsyncStorage.setItem(key, JSON.stringify(json))
}

export const isSongCached = async (_config, songId, streamFormat, _maxBitrate) => {
	return global.listCacheSong?.includes(`${songId}.${streamFormat}`) || false
}

export const getListCacheSong = async () => {
	return await FileSystem.readDirectoryAsync(FileSystem.documentDirectory)
		.then((files) => {
			return files.map((file) => file.replace('.mp3', ''))
		})
		.catch(() => [])
}

export const getPathSong = (songId, streamFormat) => {
	return `${FileSystem.documentDirectory}${songId}.${streamFormat}`
}