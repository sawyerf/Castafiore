import { Platform } from "react-native"

export const getApi = (config, path, query = '') => {
	let encodedQuery = ''
	if (typeof query === 'string') {
		encodedQuery = query
	} else if (typeof query === 'object') {
		encodedQuery = Object.keys(query).map((key) => `${key}=${encodeURIComponent(query[key])}`).join('&')
	} else {
		console.error('getApi: query is not a string or an object')
		return
	}

	return new Promise((resolve, reject) => {
		if (!config?.url || !config?.query) {
			reject('getApi: config.url or config.query is not defined')
			return
		}
		fetch(`${config.url}/rest/${path}?${config.query}&${encodedQuery}`)
			.then((response) => response.json())
			.then((json) => {
				if (json['subsonic-response'] && !json['subsonic-response']?.error) {
					resolve(json['subsonic-response'])
				} else {
					console.error(`getApi[/rest/${path}]: ${JSON.stringify(json['subsonic-response']?.error)}`)
					reject({ ...json['subsonic-response']?.error, isApiError: true })
				}
			})
			.catch((error) => {
				console.error(`getApi[/rest/${path}]: ${error}`)
				reject({ ...error, isApiError: false })
			})
	})
}

export const urlCover = (config, id, size = null) => {
	if (!config?.url || !config?.query) return null
	if (!id) return null
	if (!size) {
		return `${config.url}/rest/getCoverArt?id=${id}&${config.query}`
	}
	return `${config.url}/rest/getCoverArt?id=${id}&size=${size}&${config.query}`
}

export const urlStream = async (config, id) => {
	if (!id.match(/^[a-z0-9]*$/)) return id
	if (Platform.OS === 'web') {
		return await fetch(`${config.url}/rest/stream?id=${id}&${config.query}`)
			.then((res) => res.blob())
			.then(blob => {
				return URL.createObjectURL(blob)
			})
			.catch((err) => { return `${config.url}/rest/stream?id=${id}&${config.query}` })
	}
	return `${config.url}/rest/stream?id=${id}&${config.query}`
}