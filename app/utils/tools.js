import { getApi } from '~/utils/api'

export const shuffle = (array) => {
	return array.map(value => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value)
}

const currentRandomIndex = () => {
	return window.song.randomIndex.findIndex((item) => item === window.song.index)
}

export const nextRandomIndex = () => {
	let index = currentRandomIndex()
	if (index === -1) index = 0
	if (index + 1 >= window.song.randomIndex.length) return window.song.randomIndex[0]
	else return window.song.randomIndex[index + 1]
}

export const prevRandomIndex = () => {
	let index = currentRandomIndex()
	if (index - 1 < 0) return window.song.randomIndex[window.song.randomIndex.length - 1]
	else return window.song.randomIndex[index - 1]
}

export const saveQueue = async (config, queue, index) => {
	if (!global.saveQueue) return
	await getApi(config, 'savePlayQueue', {
		id: queue.map(item => item.id).join(','),
		current: queue[index]?.id || '',
	})
}