import React from 'react'
import { Keyboard, Platform } from 'react-native'

const useKeyboardIsOpen = () => {
	const [isKeyboardOpen, setIsKeyboardOpen] = React.useState(false)

	React.useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
			setIsKeyboardOpen(Platform.OS === 'android')
		})
		const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
			setIsKeyboardOpen(false)
		})

		return () => {
			keyboardDidShowListener.remove()
			keyboardDidHideListener.remove()
		}
	}, [])

	return isKeyboardOpen
}

export default useKeyboardIsOpen