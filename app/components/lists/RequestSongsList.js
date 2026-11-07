import React from 'react'
import { Text, View, Pressable, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import Icon from '~/components/Icon'

import { useConfig } from '~/contexts/config'
import { useSettings } from '~/contexts/settings'
import { useSongDispatch } from '~/contexts/song'
import { useTheme } from '~/contexts/theme'
import { getApi } from '~/utils/api'
import { addToQueue, playSong } from '~/utils/player'
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
					borderRadius: size.radius.sm,
					backgroundColor: i <= step ? theme.primaryTouch : theme.secondaryBack,
				}} />
			))}
		</View>
	)
}

/**
 * Songs from the full catalogue, via moderato-service. Tapping a row adds the song to
 * the library if needed and plays it as soon as Navidrome has it; the download button
 * only adds it.
 */
const RequestSongsList = ({ items, isIndex = false, getAllRef = null }) => {
	const { t } = useTranslation()
	const theme = useTheme()
	const config = useConfig()
	const settings = useSettings()
	const songDispatch = useSongDispatch()
	const [jobs, setJobs] = React.useState({})
	// Only the most recent tap starts playback, so an earlier request that finishes late does not interrupt.
	const latest = React.useRef(null)

	const setJob = (id, value) => setJobs((prev) => ({ ...prev, [id]: value }))

	const getSong = (subsonicId) =>
		getApi(config, 'getSong', { id: subsonicId }).then((json) => json?.song).catch(() => null)

	const play = async (subsonicId) => {
		const song = await getSong(subsonicId)
		if (song) playSong(config, songDispatch, [song], 0)
	}

	/** Resolves with the song's Subsonic id once it is in the library, or null if it could not be added. */
	const ensure = async (item) => {
		const current = jobs[item.id]
		if (item.cached && item.subsonicId) return item.subsonicId
		if (current?.subsonicId) return current.subsonicId
		try {
			setJob(item.id, { state: 'queued' })
			const subsonicId = await fetchSong(settings, item.id, (job) => setJob(item.id, { state: job.state }))
			setJob(item.id, { state: 'done', subsonicId })
			return subsonicId
		} catch (error) {
			setJob(item.id, { error: error?.message ?? t('songService.job.failed') })
			return null
		}
	}

	/**
	 * Add every song. With `play`, also play them in list order: the first one starts as
	 * soon as it is ready, the rest join the queue as they arrive. The service downloads
	 * one at a time.
	 */
	const getAll = async ({ play = true } = {}) => {
		const pending = items.map(ensure)
		if (!play) return
		const token = {}
		latest.current = token
		let started = false
		for (const p of pending) {
			const subsonicId = await p
			if (!subsonicId || latest.current !== token) continue
			const song = await getSong(subsonicId)
			if (!song) continue
			if (started) addToQueue(songDispatch, song)
			else playSong(config, songDispatch, [song], 0)
			started = true
		}
	}
	if (getAllRef) getAllRef.current = getAll

	const onPress = async (item) => {
		const current = jobs[item.id]
		if (current && !current.error && current.state !== 'done') return
		latest.current = item.id
		const subsonicId = await ensure(item)
		if (subsonicId && latest.current === item.id) await play(subsonicId)
	}

	const add = (item) => {
		const current = jobs[item.id]
		if (current && !current.error) return
		ensure(item)
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
								{isIndex && item.trackNumber ? `${item.trackNumber}. ` : ''}{item.title}
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
						{inLibrary || busy ? (
							<Icon
								name={inLibrary ? 'check' : 'hourglass-half'}
								size={size.icon.tiny}
								color={inLibrary ? theme.primaryTouch : theme.secondaryText}
								style={styles.action}
								accessibilityLabel={inLibrary ? t('songService.In your library') : undefined}
							/>
						) : (
							<Pressable
								onPress={() => add(item)}
								hitSlop={10}
								style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.action])}
								accessibilityRole="button"
								accessibilityLabel={t('songService.Add title', { title: item.title })}
							>
								<Icon name="cloud-download" size={size.icon.tiny} color={theme.secondaryText} />
							</Pressable>
						)}
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
		borderRadius: size.radius.sm,
	},
	action: {
		padding: 5,
		paddingStart: 10,
	},
})

export default RequestSongsList
