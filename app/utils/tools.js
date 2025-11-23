import { getApi } from '~/utils/api'

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

export const saveQueue = async (config, queue, index) => {
	if (!global.saveQueue) return
	await getApi(config, 'savePlayQueue', {
		id: queue.map(item => item.id).join(','),
		current: queue[index]?.id || '',
	})
}