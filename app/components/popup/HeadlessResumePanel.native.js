import React from 'react'
import { Modal, View, Text, Pressable, Platform } from 'react-native'
import { useTranslation } from 'react-i18next'

import { useTheme } from '~/contexts/theme'
import mainStyles from '~/styles/main'

// context: 'boot' | 'manual'
const HeadlessResumePanel = ({ visible, context, onResume, onSend, onCancel }) => {
	const { t } = useTranslation()
	const theme = useTheme()

	return (
		<Modal
			transparent
			visible={visible}
			statusBarTranslucent
			navigationBarTranslucent={!(Platform.OS === 'android' && parseInt(Platform.Version, 10) > 34)}
			onRequestClose={onCancel}
		>
			<View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
				<View style={{
					backgroundColor: theme.primaryBack,
					borderTopLeftRadius: 20,
					borderTopRightRadius: 20,
					paddingTop: 24,
					paddingHorizontal: 24,
					paddingBottom: 40,
					gap: 12,
				}}>
					<Text style={[mainStyles.mainTitle(theme), { marginBottom: 0, marginTop: 0, marginStart: 0 }]}>
						{t('Castafiore Connect')}
					</Text>
					<Text style={{ color: theme.primaryText }}>
						{t('headless.resume.message')}
					</Text>
					<Pressable
						onPress={onResume}
						style={{
							backgroundColor: theme.primaryTouch,
							borderRadius: 10,
							padding: 14,
							alignItems: 'center',
						}}
					>
						<Text style={{ color: '#fff', fontWeight: 'bold' }}>
							{t('headless.resume.yes')}
						</Text>
					</Pressable>
					{context === 'manual' && (
						<Pressable
							onPress={onSend}
							style={{
								backgroundColor: theme.secondaryBack,
								borderRadius: 10,
								padding: 14,
								alignItems: 'center',
							}}
						>
							<Text style={{ color: theme.primaryText }}>
								{t('headless.resume.send')}
							</Text>
						</Pressable>
					)}
					<Pressable
						onPress={onCancel}
						style={{ padding: 14, alignItems: 'center' }}
					>
						<Text style={{ color: theme.secondaryText }}>
							{t('headless.resume.cancel')}
						</Text>
					</Pressable>
				</View>
			</View>
		</Modal>
	)
}

export default HeadlessResumePanel
