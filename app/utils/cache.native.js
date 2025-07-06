import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system'

// API Cache
export const getCache = async (_cacheName, _key) => {
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

// Song Cache
export const isSongCached = async (_config, songId, streamFormat, _maxBitrate) => {
	return global.listCacheSong?.includes(`${songId}.${streamFormat}`) || false
}

export const getListCacheSong = async () => {
	return await FileSystem.readDirectoryAsync(getPathDir())
		.then((files) => {
			return files.map((file) => file.replace('.mp3', ''))
		})
		.catch(() => [])
}

export const getPathSong = (songId, streamFormat) => {
	return `${getPathDir()}${songId}.${streamFormat}`
}

const getPathDir = () => {
	return `${FileSystem.documentDirectory}/cache/${global.folderCache}/songs/`
}

export const initCacheSong = async () => {
	await FileSystem.makeDirectoryAsync(getPathDir(), { intermediates: true })
		.catch(() => {})
	global.listCacheSong = await getListCacheSong() || []
}

// Cache Settings
export const clearCache = async () => {
	await AsyncStorage.multiRemove(
		await AsyncStorage.getAllKeys()
			.then(keys => keys.filter(key => key.startsWith('http')))
			.catch(() => [])
	)
	await FileSystem.readDirectoryAsync(getPathDir())
		.then(files => {
			const deletePromises = files.map(file => FileSystem.deleteAsync(`${getPathDir()}${file}`))
			return Promise.all(deletePromises)
		})
		.catch(() => [])
	await initCacheSong()
}

export const getStatCache = async () => {
	return [
		{
			name: 'Cache Api',
			count: await AsyncStorage.getAllKeys()
				.then(keys => keys.filter(key => key.startsWith('http')).length)
				.catch(() => 0)
		},
		{
			name: 'Cache Songs',
			count: await getListCacheSong()
				.then(files => files.length)
				.catch(() => 0)
		},
		{
			name: 'Cache Songs Size',
			count: await FileSystem.getInfoAsync(getPathDir())
				.then(info => `${(info.size / (1024 * 1024)) | 0 || 0} MB`)
				.catch(() => '0.00')
		},
	]
}
