import { Platform, NativeModules } from 'react-native'

export const localeLang = () => {
  if (Platform.OS === 'android') return NativeModules.I18nManager.localeIdentifier.substring(0, 2)
  else if (Platform.OS === 'web') return (navigator.language || navigator.userLanguage || 'en').substring(0, 2)
  return null
}