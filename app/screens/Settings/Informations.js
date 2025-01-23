import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ConfigContext } from '~/contexts/config'
import { useCachedAndApi } from '~/utils/api'
import { ThemeContext } from '~/contexts/theme'
import Header from '~/components/Header'
import mainStyles from '~/styles/main'
import settingStyles from '~/styles/settings'
import TableItem from '~/components/settings/TableItem'

const ROLES = [
	"adminRole",
	"podcastRole",
	"streamRole",
	"jukeboxRole",
	"shareRole",
	"videoConversionRole",
	"scrobblingEnabled",
	"settingsRole",
	"downloadRole",
	"uploadRole",
	"playlistRole",
	"coverArtRole",
	"commentRole",
]

const InformationsSettings = () => {
	const insets = useSafeAreaInsets()
	const theme = React.useContext(ThemeContext)
	const config = React.useContext(ConfigContext)
	const [server, setServer] = React.useState({})

	const user = useCachedAndApi([], 'getUser', {}, (json, setData) => {
			setServer({
				version: json.serverVersion,
				name: json.type,
				apiVersion: json.version,
				connected: json.status === 'ok',
			})
			setData(json.user)
		})
	const scan = useCachedAndApi([], 'getScanStatus', {}, (json, setData) => {
		setData(json.scanStatus)
	})

	const convertDate = (date) => {
		if (!date) return ''
		const d = new Date(date)
		return d.toLocaleString()
	}

	return (
		<ScrollView
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<Header title="Informations" />

			<View style={[settingStyles.contentMainContainer, { marginTop: 30 }]}>
				<Text style={settingStyles.titleContainer(theme)}>Server</Text >
				<View style={settingStyles.optionsContainer(theme)}>
					<TableItem
						title={'Status'}
						value={server.connected ? 'connected' : 'not connected'}
					/>
					<TableItem
						title={'Server'}
						value={server.name}
					/>
					<TableItem
						title={'Version'}
						value={server.version}
					/>
					<TableItem
						title={'API Version'}
						value={server.apiVersion}
					/>
					<TableItem
						title={'Url'}
						value={config.url}
						isLast={true}
					/>
				</View>
			</View>
			<View style={[settingStyles.contentMainContainer]}>
				<Text style={settingStyles.titleContainer(theme)}>Scan</Text >
				<View style={settingStyles.optionsContainer(theme)}>
					<TableItem
						title={'Last Scan'}
						value={convertDate(scan.lastScan)}
					/>
					<TableItem
						title={'Folder Scanned'}
						value={scan.folderCount}
					/>
					<TableItem
						title={'Files Scanned'}
						value={scan.count}
						isLast={true}
					/>
				</View>
			</View>
			<View style={[settingStyles.contentMainContainer]}>
				<Text style={settingStyles.titleContainer(theme)}>User</Text >
				<View style={settingStyles.optionsContainer(theme)}>
					<TableItem
						title={'Username'}
						value={user.username}
					/>
					<TableItem
						title={'Email'}
						value={user.email}
						isLast={true}
					/>
				</View>
			</View>
			<View style={[settingStyles.contentMainContainer]}>
				<Text style={settingStyles.titleContainer(theme)}>User Role</Text >
				<View style={settingStyles.optionsContainer(theme)}>
					{
						ROLES.map((role, index) => {
							if (!(role in user)) return null
							return (
								<TableItem
									key={role}
									title={role}
									value={user[role]}
									isLast={index === ROLES.length - 1}
								/>
							)
						})
					}
				</View>
			</View>
		</ScrollView>
	)
}

export default InformationsSettings;