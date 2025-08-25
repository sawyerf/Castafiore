const log = (level, message) => {
	if (!global.logs) global.logs = []
	global.logs.push({
		level,
		message: message.join(' '),
		timestamp: new Date().toISOString(),
	})
	if (global.logs.length > 1000) global.logs.shift()
}

const info = (...message) => {
	log('info', message)
	console.log(...message)
}

const debug = (...message) => {
	log('debug', message)
	console.debug(...message)
}

const error = (...message) => {
	log('error', message)
	console.error(...message)
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