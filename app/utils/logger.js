const log = (level, message, source) => {
	if (!global.logs) global.logs = []
	global.logs.push({
		source,
		level,
		message: message.join(' '),
		timestamp: new Date().toISOString(),
	})
	if (global.logs.length > 1000) global.logs.shift()
}

const info = (source, ...message) => {
	log('info', message, source)
	console.log(`[${source}]`, ...message)
}

const debug = (source, ...message) => {
	log('debug', message, source)
	console.debug(`[${source}]`, ...message)
}

const error = (source, ...message) => {
	log('error', message, source)
	console.error(`[${source}]`, ...message)
}

const get = () => {
	return global.logs || []
}

export default {
	log,
	error,
	info,
	debug,
	get,
}