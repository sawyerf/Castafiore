import AsyncStorage from '@react-native-async-storage/async-storage'

export const getCache = async (cacheName, key) => {
  return null
}

export const clearCache = async () => {
  return null
}

export const getStatCache = async () => {
  return null
}

export const getJsonCache = async (cacheName, key) => {
  const json = await AsyncStorage.getItem(key)
  return json ? JSON.parse(json) : null
}

export const setJsonCache = async (cacheName, key, json) => {
  if (!json) return
  await AsyncStorage.setItem(key, JSON.stringify(json))
}