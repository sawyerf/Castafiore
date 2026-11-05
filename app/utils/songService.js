import logger from '~/utils/logger'

/**
 * Client for moderato-service: searches a full music catalogue and adds a missing
 * song to the Navidrome library, then returns its Subsonic id.
 * See https://github.com/totoLab/moderato (ARCHITECTURE.md, section 4).
 */

export const JOB_STEPS = ['queued', 'resolving', 'downloading', 'tagging', 'scanning', 'done']

export const JOB_LABELS = {
	queued: 'Waiting in line',
	resolving: 'Finding the best match',
	downloading: 'Downloading audio',
	tagging: 'Adding song details',
	scanning: 'Adding to your library',
	done: 'Ready',
	failed: 'Could not add this song',
}

export const isServiceConfigured = (settings) => !!(settings?.songServiceUrl?.trim() && settings?.songServiceToken?.trim())

const request = async (settings, path, init = {}) => {
	const url = `${settings.songServiceUrl.trim().replace(/\/+$/, '')}${path}`
	let res
	try {
		res = await fetch(url, {
			...init,
			headers: {
				Authorization: `Bearer ${settings.songServiceToken.trim()}`,
				'Content-Type': 'application/json',
				...init.headers,
			},
		})
	} catch (error) {
		logger.error('songService', `${path}: ${error}`)
		throw new Error('Could not reach the song service. Check its address in Settings.')
	}
	if (res.status === 401) throw new Error('The song service rejected the access token. Check it in Settings.')
	if (!res.ok) {
		const body = await res.json().catch(() => ({}))
		throw new Error(body.error ?? `The song service returned HTTP ${res.status}.`)
	}
	return res.json()
}

/** @returns {Promise<{ items: Array, albums: Array, catalogError?: string }>} */
export const searchCatalog = (settings, query, limit = 20) =>
	request(settings, `/v1/search?q=${encodeURIComponent(query)}&limit=${limit}`)

/** An album from the catalogue and its tracks, each with a track id that can be requested. */
export const getCatalogAlbum = (settings, albumId) =>
	request(settings, `/v1/albums/${encodeURIComponent(albumId)}`)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Request a song and wait until it is in the library. Calls onState with each job.
 * Resolves with the Subsonic song id.
 */
export const fetchSong = async (settings, trackId, onState = () => { }) => {
	let { job } = await request(settings, '/v1/songs/request', {
		method: 'POST',
		body: JSON.stringify({ trackId }),
	})
	onState(job)
	while (job.state !== 'done' && job.state !== 'failed') {
		await sleep(1000)
		job = (await request(settings, `/v1/jobs/${job.id}`)).job
		onState(job)
	}
	if (job.state === 'failed' || !job.subsonicId) throw new Error(job.error ?? JOB_LABELS.failed)
	return job.subsonicId
}
