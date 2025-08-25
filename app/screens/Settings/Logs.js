import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ThemeContext } from '~/contexts/theme';
import Header from '~/components/Header';
import mainStyles from '~/styles/main';
import settingStyles from '~/styles/settings';

const EXAMPLE = [
	{ level: 'info', message: 'This is an info message', timestamp: Date.now() },
	{ level: 'warn', message: 'This is a warning message', timestamp: Date.now() },
	{ level: 'error', message: 'This is an error message', timestamp: Date.now() },
	{ level: 'info', message: 'A very long info message that should be truncated when it exceeds the width of the screen\nThis is the second line of the message', timestamp: Date.now() },
]

const colorLevel = (level) => {
	if (level === 'info') return '#17a2b8'
	if (level === 'warn') return '#ffc107'
	if (level === 'error') return '#dc3545'
	return '#6c757d'
}

const LogItem = ({ level, message, timestamp, isLast = false }) => {
	const theme = React.useContext(ThemeContext)

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
					width: 55,
					borderRadius: 4,
					paddingHorizontal: 6,
					paddingVertical: 2,
					alignItems: 'center',
				}}>
					<Text style={{ color: '#fff', fontSize: 12, textTransform: 'uppercase' }}>{level}</Text>
				</View>
				<Text style={[settingStyles.primaryText(theme), {
					marginStart: 10,
					fontSize: 12,
					color: theme.secondaryText,
				}]}>{new Date(timestamp).toLocaleString()}</Text>
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
	const theme = React.useContext(ThemeContext)

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
						EXAMPLE.map((log, index) => (
							<LogItem
								key={index}
								level={log.level}
								message={log.message}
								timestamp={log.timestamp}
								isLast={index === EXAMPLE.length - 1}
							/>
						))
					}
				</View>
			</View>
		</ScrollView>
	)
}

export default Logs;