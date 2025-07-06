import React from 'react'
import { View, Text, ScrollView, Platform, Share } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next';

import { ConfigContext } from '~/contexts/config'
import { confirmAlert } from '~/utils/alert'
import { ThemeContext } from '~/contexts/theme'
import { useCachedAndApi, getApi } from '~/utils/api'
import ButtonText from '~/components/settings/ButtonText'
import Header from '~/components/Header'
import mainStyles from '~/styles/main'
import OptionsPopup from '~/components/popup/OptionsPopup'
import settingStyles from '~/styles/settings'
import TableItem from '~/components/settings/TableItem'

const SharesSettings = () => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const theme = React.useContext(ThemeContext)
	const refOption = React.useRef()
	const config = React.useContext(ConfigContext)
	const [indexOptions, setIndexOptions] = React.useState(-1)

	const [shares, refresh] = useCachedAndApi([], 'getShares', null, (json, setData) => {
		setData(json.shares?.share || [])
	})

	return (
		<ScrollView
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<Header title={t("Shares")} />

			<View style={[settingStyles.contentMainContainer, { marginTop: 30 }]}>
				<Text style={settingStyles.titleContainer(theme)}>Shares</Text>
				<View style={settingStyles.optionsContainer(theme)}>
					{
						shares.length === 0 && (
							<TableItem
								title="No shares found"
								value=""
								isLast
							/>
						)
					}
					{
						shares.map((item, index) => {
							return (
								<TableItem
									key={index}
									title={item.description}
									value={item.id}
									toCopy={item.url}
									isLast={index === shares.length - 1}
									onLongPress={() => {
										setIndexOptions(index)
									}}
								/>
							)
						})
					}
				</View>
			</View>

			<ButtonText
				text="Clear all shares"
				onPress={() => {
					confirmAlert(
						'Clear all shares',
						'Are you sure you want to clear all shares?', () => {
							if (shares.length === 0) return
							const wait = shares?.map((item) => {
								return getApi(config, 'deleteShare', { id: item.id })
							})
							Promise.all(wait).then(() => {
								refresh()
							})
						})
				}}
			/>

			{/* Popups */}
			<OptionsPopup
				reff={refOption}
				visible={indexOptions >= 0}
				close={() => {
					setIndexOptions(-1)
				}}
				options={[
					{
						name: 'Share',
						icon: 'share',
						onPress: () => {
							if (Platform.OS === 'web') navigator.clipboard.writeText(shares[indexOptions].url)
							else Share.share({ message: shares[indexOptions].url })
							refOption.current.close()
						}
					},
					{
						name: 'Delete',
						icon: 'trash-o',
						onPress: () => {
							getApi(config, 'deleteShare', { id: shares[indexOptions].id })
								.then(() => {
									refresh()
								})
							refOption.current.close()
						}
					}
				]}
			/>

		</ScrollView>
	)
}

export default SharesSettings;