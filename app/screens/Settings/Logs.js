import React from 'react'
import { Text, View, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { useTheme } from '~/contexts/theme'
import size from '~/styles/size'
import logger from '~/utils/logger'
import Header from '~/components/Header'
import mainStyles from '~/styles/main'
import settingStyles from '~/styles/settings'

const colorLevel = (level) => {
	if (level === 'info') return '#16B87C'
	if (level === 'warn') return '#ffc107'
	if (level === 'error') return '#dc3545'
	return '#6c757d'
}

const LogItem = ({ level, message, timestamp, source, isLast = false }) => {
	const theme = useTheme()

	return (
		<View style={[settingStyles.optionItem(theme, isLast), {
			height: 'auto',
			minHeight: 50,
			paddingVertical: 13.5,
			flexDirection: 'column',
			alignItems: 'flex-start',
			gap: 5,
		}]}>
			<View style={{
				flexDirection: 'row',
				alignItems: 'center',
				flex: 1,
				width: '100%',
			}}>
				<View style={{
					backgroundColor: colorLevel(level),
					height: 10,
					width: 10,
					borderRadius: size.radius.circle,
					alignItems: 'center',
				}}>
					{/* <Text style={{ color: '#fff', fontSize: 12, textTransform: 'uppercase' }}>{level}</Text> */}
				</View>
				<Text style={[settingStyles.primaryText(theme), {
					marginStart: 10,
					fontSize: 12,
					color: theme.secondaryText,
				}]}>{new Date(timestamp).toLocaleString()} · {source}</Text>
			</View>
			<Text style={[settingStyles.primaryText(theme), {
				flex: 1,
			}]}>{message}</Text>
		</View>
	)
}

const Logs = () => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const theme = useTheme()
	const [logs, setLogs] = React.useState([])

	React.useEffect(() => {
		setLogs([...logger.get()].reverse())
	}, [])

	React.useEffect(() => {
		const timeoutId = setInterval(() => {
			const currentLogs = [...logger.get()]
			if (currentLogs.length !== logs.length) setLogs(currentLogs.reverse())
		}, 1000)

		return () => clearInterval(timeoutId)
	}, [logs])

	return (
		<ScrollView
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<Header title={t("Logs")} />
			<View style={settingStyles.contentMainContainer}>
				<Text style={settingStyles.titleContainer(theme)}>{t('Logs')}</Text>
				<View style={settingStyles.optionsContainer(theme)}>
					{
						logs.length === 0 && (
							<Text style={[settingStyles.primaryText(theme), { textAlign: 'center', padding: 20 }]}>{t('No logs yet')}</Text>
						)
					}
					{
						logs.map((log, index) => (
							<LogItem
								key={index}
								level={log.level}
								message={log.message}
								timestamp={log.timestamp}
								source={log.source}
								isLast={index === logs.length - 1}
							/>
						))
					}
				</View>
			</View>
		</ScrollView>
	)
}

export default Logs