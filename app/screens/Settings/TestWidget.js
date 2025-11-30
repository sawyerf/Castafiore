import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { ThemeContext } from '~/contexts/theme'
import Header from '~/components/Header'
import mainStyles from '~/styles/main'
import SelectItem from '~/components/settings/SelectItem'
import settingStyles from '~/styles/settings'
import { nameToWidget } from '~/widgets/widget-task-handler'
import { WidgetPreview } from 'react-native-android-widget'
import TrackPlayer from 'react-native-track-player'

const PlayerSettings = () => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const theme = React.useContext(ThemeContext)
	const [widget, setWidget] = React.useState('Favorited')
	const [props, setProps] = React.useState({
		width: 200,
		height: 200,
	})

	React.useEffect(() => {
		if (widget === 'Player') {
			TrackPlayer.getActiveTrack()
				.then((track) => {
					setProps({
						width: 320,
						height: 200,
						coverUrl: track.artwork,
						isPlaying: true,
					})
				})

		} else if (widget === 'Favorited') {
			setProps({
				width: 200,
				height: 200,
			})
		}
	}, [widget])

	return (
		<ScrollView
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<Header title={t("Widgets")} />

			<View style={settingStyles.contentMainContainer}>
				<View style={settingStyles.optionsContainer(theme)}>
					{Object.keys(nameToWidget).map((item, index) => {
						return (
							<SelectItem
								key={index}
								text={item}
								isSelect={widget === item}
								onPress={() => {
									setWidget(item)
								}}
							/>
						)
					})}
				</View>
			</View>
			<View style={{
				width: '100%',
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
			}}
			>
				<WidgetPreview
					renderWidget={() => nameToWidget[widget](props)}
					width={props.width}
					height={props.height}
				/>
			</View>

		</ScrollView>
	)
}

export default PlayerSettings