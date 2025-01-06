import { Platform, Alert } from 'react-native'

export const confirmAlert = (title, message, confirmCallback, cancelCallBack = () => { }) => {
	if (Platform.OS === 'web') {
		const result = window.confirm(message)
		if (result) confirmCallback()
		else cancelCallBack()
	} else {
		Alert.alert(
			title,
			message,
			[
				{ text: 'Cancel', onPress: cancelCallBack, style: 'cancel' },
				{ text: 'OK', onPress: confirmCallback }
			]
		)
	}
}
