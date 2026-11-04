import React from 'react'
import { Text, View, Pressable, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import Icon from 'react-native-vector-icons/FontAwesome'

import { useConfig } from '~/contexts/config'
import { useSettings } from '~/contexts/settings'
import { useSongDispatch } from '~/contexts/song'
import { useTheme } from '~/contexts/theme'
import { getApi } from '~/utils/api'
import { playSong } from '~/utils/player'
import { fetchSong, JOB_STEPS } from '~/utils/songService'
import ImageError from '~/components/ImageError'
import mainStyles from '~/styles/main'
import size from '~/styles/size'

const duration = (ms) => {
	if (!ms) return ''
	const s = Math.round(ms / 1000)
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const Progress = ({ state }) => {
	const theme = useTheme()
	const step = JOB_STEPS.indexOf(state)

	return (
		<View style={{ flexDirection: 'row', gap: 3, marginTop: 4 }}>
			{JOB_STEPS.map((s, i) => (
				<View key={s} style={{
					flex: 1,
					height: 3,
					borderRadius: 2,
					backgroundColor: i <= step ? theme.primaryTouch : theme.secondaryBack,
				}} />
			))}
		</View>
	)
}

/**
 * Songs from the full catalogue, via moderato-service. Tapping one adds it to the
 * library if needed and plays it as soon as Navidrome has it.
 */
const RequestSongsList = ({ items }) => {
	const { t } = useTranslation()
	const theme = useTheme()
	const config = useConfig()
	const settings = useSettings()
	const songDispatch = useSongDispatch()
	const [jobs, setJobs] = React.useState({})
	// Only the most recent tap starts playback, so an earlier request that finishes late does not interrupt.
	const latest = React.useRef(null)

	const setJob = (id, value) => setJobs((prev) => ({ ...prev, [id]: value }))

	const play = async (subsonicId) => {
		const json = await getApi(config, 'getSong', { id: subsonicId })
		if (json?.song) playSong(config, songDispatch, [json.song], 0)
	}

	const onPress = async (item) => {
		const current = jobs[item.id]
		if (current && !current.error && current.state !== 'done') return
		latest.current = item.id
		try {
			if (item.cached && item.subsonicId) {
				await play(item.subsonicId)
				return
			}
			setJob(item.id, { state: 'queued' })
			const subsonicId = await fetchSong(settings, item.id, (job) => setJob(item.id, { state: job.state }))
			setJob(item.id, { state: 'done', subsonicId })
			if (latest.current === item.id) await play(subsonicId)
		} catch (error) {
			setJob(item.id, { error: error?.message ?? t('songService.job.failed') })
		}
	}

	return (
		<View style={{ flexDirection: 'column', paddingHorizontal: 20 }}>
			{items.map((item) => {
				const job = jobs[item.id]
				const inLibrary = item.cached || job?.state === 'done'
				const busy = job && !job.error && job.state !== 'done'

				return (
					<Pressable
						key={item.id}
						style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.row])}
						onPress={() => onPress(job?.subsonicId ? { ...item, cached: true, subsonicId: job.subsonicId } : item)}
						disabled={busy}
						accessibilityLabel={inLibrary ? t('songService.Play title', { title: item.title }) : t('songService.Get and play title', { title: item.title })}
					>
						<View style={[mainStyles.coverSmall(theme), { overflow: 'hidden', marginRight: 10 }]}>
							<ImageError style={[mainStyles.coverSmall(theme)]} source={{ uri: item.coverUrl }} />
						</View>
						<View style={{ flex: 1, flexDirection: 'column' }}>
							<Text numberOfLines={1} style={[mainStyles.mediumText(theme.primaryText), { marginBottom: 2 }]}>
								{item.title}
							</Text>
							<Text numberOfLines={1} style={mainStyles.smallText(job?.error ? theme.primaryTouch : theme.secondaryText)}>
								{job?.error
									? job.error
									: busy
										? t(`songService.job.${job.state}`)
										: [item.artist, item.album, duration(item.durationMs)].filter(Boolean).join(' · ')}
							</Text>
							{busy && <Progress state={job.state} />}
						</View>
						<Icon
							name={inLibrary ? 'play' : busy ? 'hourglass-half' : 'cloud-download'}
							size={size.icon.tiny}
							color={inLibrary ? theme.primaryTouch : theme.secondaryText}
							style={{ padding: 5, paddingStart: 10 }}
						/>
					</Pressable>
				)
			})}
		</View>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: size.image.small,
		marginBottom: 10,
		borderRadius: 4,
	},
})

export default RequestSongsList
