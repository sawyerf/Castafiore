import React from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { useTheme } from '~/contexts/theme'
import IconButton from '~/components/button/IconButton'
import mainStyles from '~/styles/main'
import size from '~/styles/size'

const RatingPopup = ({ visible, rating, onSelectRating, onSave, onClose }) => {
	const { t } = useTranslation()
	const theme = useTheme()

	if (!visible) return null

	return (
		<Modal
			transparent={true}
			onRequestClose={onClose}
			statusBarTranslucent={true}
			visible={visible}
		>
			<Pressable
				onPress={onClose}
				style={{
					flex: 1,
					backgroundColor: 'rgba(0,0,0,0.5)',
					justifyContent: 'center',
					alignItems: 'center',
					padding: 20,
				}}
			>
				<View
					style={{
						width: '100%',
						maxWidth: 320,
						backgroundColor: theme.secondaryBack,
						borderRadius: 15,
						padding: 20,
						paddingTop: 26,
						gap: 15,
					}}
				>
					<View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
						{[1, 2, 3, 4, 5].map((value) => (
							<IconButton
								key={value}
								size={size.icon.small}
								icon={value <= rating ? 'star' : 'star-o'}
								color={value <= rating ? theme.primaryTouch : theme.secondaryText}
								style={{ padding: 2 }}
								onPress={() => onSelectRating(value)}
							/>
						))}
					</View>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
						<Pressable
							onPress={() => {
								onSelectRating(0)
								onSave()
							}}
							style={({ pressed }) => ([mainStyles.opacity({ pressed }), { padding: 6 }])}
						>
							<Text style={mainStyles.smallText(theme.secondaryText)}>{t('Clear')}</Text>
						</Pressable>
						<Pressable
							onPress={onSave}
							style={({ pressed }) => ([mainStyles.opacity({ pressed }), { padding: 6 }])}
						>
							<Text style={mainStyles.smallText(theme.primaryTouch)}>{t('Save')}</Text>
						</Pressable>
					</View>
				</View>
			</Pressable>
		</Modal>
	)
}

export default RatingPopup
