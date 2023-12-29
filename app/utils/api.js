import { Platform } from "react-native"

export const getApi = (config, path, query = '') => {
	return new Promise((resolve, reject) => {
		if (!config?.url || !config?.query) {
			reject('getApi: config.url or config.query is not defined')
			return
		}
		// console.log(`getApi: /rest/${path}?${query}`)
		fetch(`${config.url}/rest/${path}?${config.query}&${query}`)
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