import { getApi, postApi } from '~/utils/api'
import logger from '~/utils/logger'

export const shuffle = (array) => {
	return array.map(value => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value)
}

const currentRandomIndex = () => {
	return global.song.randomIndex.findIndex((item) => item === global.song.index)
}

export const nextRandomIndex = () => {
	let index = currentRandomIndex()
	if (index === -1) index = 0
	if (index + 1 >= global.song.randomIndex.length) return global.song.randomIndex[0]
	else return global.song.randomIndex[index + 1]
}

export const prevRandomIndex = () => {
	let index = currentRandomIndex()
	if (index - 1 < 0) return global.song.randomIndex[global.song.randomIndex.length - 1]
	else return global.song.randomIndex[index - 1]
}

// One "id" parameter per song (Subsonic spec): comma separated ids are read as one unknown id.
// Long queues go in a POST body: the GET url would be too long for the server / reverse proxy.
const MAX_GET_QUERY = 4000

export const saveQueue = async (config, queue, index) => {
	if (!global.saveQueue || !queue?.length) return
	const ids = queue
		.map(item => item.id)
		.filter(id => id && /^[a-zA-Z0-9-]+$/.test(id)) // no radio / special tracks
	if (!ids.length) return
	const current = queue[index]?.id
	const query = [
		...ids.map(id => `id=${encodeURIComponent(id)}`),
		ids.includes(current) ? `current=${encodeURIComponent(current)}` : '',
	].filter(Boolean).join('&')

	const request = query.length < MAX_GET_QUERY ?
		getApi(config, 'savePlayQueue', query) :
		postApi(config, 'savePlayQueue', query)
	await request.catch((error) => logger.error('saveQueue', error?.message || String(error)))
}