import React from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import Icon from 'react-native-vector-icons/FontAwesome'

import { useTheme } from '~/contexts/theme'
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
				<Pressable
					onPress={() => {}}
					style={{
						width: '100%',
						maxWidth: 320,
						backgroundColor: theme.secondaryBack,
						borderRadius: 15,
						padding: 20,
						gap: 15,
					}}
				>
					<Text style={mainStyles.mediumText(theme.primaryText)}>
						{t('Set rating')}
					</Text>
					<View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
						{[1, 2, 3, 4, 5].map((value) => (
							<Pressable
								key={value}
								onPress={() => onSelectRating(value)}
								style={({ pressed }) => ([mainStyles.opacity({ pressed }), { padding: 2 }])}
							>
								<Icon
									name={value <= rating ? 'star' : 'star-o'}
									size={size.icon.small}
									color={value <= rating ? theme.primaryTouch : theme.secondaryText}
								/>
							</Pressable>
						))}
					</View>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
						<Pressable
							onPress={() => onSelectRating(0)}
							style={({ pressed }) => ([mainStyles.opacity({ pressed }), { paddingVertical: 6 }])}
						>
							<Text style={mainStyles.smallText(theme.secondaryText)}>{t('Clear')}</Text>
						</Pressable>
						<Pressable
							onPress={onSave}
							style={({ pressed }) => ([mainStyles.opacity({ pressed }), { paddingVertical: 6 }])}
						>
							<Text style={mainStyles.smallText(theme.primaryTouch)}>{t('Save')}</Text>
						</Pressable>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	)
}

export default RatingPopup
