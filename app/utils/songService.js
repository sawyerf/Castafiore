import md5 from 'md5'

import logger from '~/utils/logger'

/**
 * Client for moderato: searches a full music catalogue and adds a missing
 * song to the Navidrome library, then returns its Subsonic id.
 * It signs in with the account you use for your server, so it needs no token of its own.
 * See https://github.com/totoLab/moderato (ARCHITECTURE.md, sections 4 and 5).
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

export const isServiceConfigured = (settings) => !!settings?.songServiceUrl?.trim()

const randomSalt = () => Math.random().toString(36).substring(2, 15)
const fromHex = (hex) => hex.match(/../g)?.map((h) => String.fromCharCode(parseInt(h, 16))).join('') ?? ''

// React Native's URLSearchParams has no get(), so the saved login query is parsed by hand.
const parseQuery = (query) => Object.fromEntries(query.split('&').map((pair) => {
	const [key, ...rest] = pair.split('=')
	return [key, decodeURIComponent(rest.join('='))]
}))

// Logins saved with a plain password get one salt per login, not per request:
// the service caches a verified token, and a new salt would make it ask the server again.
const plainLoginAuth = new Map()

/**
 * The Authorization header for the current server login, `Subsonic <user>:<salt>:<token>`.
 * Token logins are reused as they are; plain-password logins are turned into a token.
 */
const authorization = () => {
	const query = global.config?.query
	if (!query) throw new Error('Connect to your music server first. The song service signs in with that account.')
	const params = parseQuery(query)
	const user = params.u
	let salt = params.s
	let token = params.t
	if (!salt || !token) {
		const password = params.p
		if (!user || !password) throw new Error('Connect to your music server first. The song service signs in with that account.')
		if (!plainLoginAuth.has(query)) {
			const plain = password.startsWith('enc:') ? fromHex(password.slice(4)) : password
			const newSalt = randomSalt()
			plainLoginAuth.set(query, { salt: newSalt, token: md5(plain + newSalt) })
		}
		({ salt, token } = plainLoginAuth.get(query))
	}
	return `Subsonic ${encodeURIComponent(user)}:${salt}:${token}`
}

const request = async (settings, path, init = {}) => {
	const url = `${settings.songServiceUrl.trim().replace(/\/+$/, '')}${path}`
	const auth = authorization()
	let res
	try {
		res = await fetch(url, {
			...init,
			headers: {
				Authorization: auth,
				'Content-Type': 'application/json',
				...init.headers,
			},
		})
	} catch (error) {
		logger.error('songService', `${path}: ${error}`)
		throw new Error('Could not reach the song service. Check its address in Settings.')
	}
	if (res.status === 401) throw new Error('The song service did not accept your server login. Connect to your server again in Settings.')
	// 403 (account not allowed), 429 (too many songs waiting) and others carry a readable message.
	if (!res.ok) {
		const body = await res.json().catch(() => ({}))
		throw new Error(body.error ?? `The song service returned HTTP ${res.status}.`)
	}
	return res.json()
}

/** Who the song service signed you in as. Fails if your account may not use it. */
export const getMe = (settings) => request(settings, '/v1/me')

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
