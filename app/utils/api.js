import React from "react"
import { ConfigContext } from "~/contexts/config"
import { getJsonCache, setJsonCache } from "~/utils/cache"

const getUrl = (config, path, query = '') => {
	let encodedQuery = ''
	if (typeof query === 'string') {
		encodedQuery = query
	} else if (query === null || query === undefined) {
		encodedQuery = ''
	} else if (typeof query === 'object') {
		encodedQuery = Object.keys(query).map((key) => `${key}=${encodeURIComponent(query[key])}`).join('&')
	} else {
		console.error('getApi: query is not a string or an object')
		return ''
	}
	return `${config.url}/rest/${path}?${config.query}&f=json&${encodedQuery}`
}

export const getApi = (config, path, query = '') => {
	return new Promise((resolve, reject) => {
		if (!config?.url || !config?.query) {
			reject('getApi: config.url or config.query is not defined')
			return
		}
		const url = getUrl(config, path, query)
		fetch(url)
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

export const getCachedAndApi = async (config, path, query = '', setData = () => { }) => {
	if (!config?.url || !config?.query) {
		console.error('getCachedApi: config.url or config.query is not defined')
		return
	}

	let json = null
	const key = getUrl(config, path, query)
	json = await getJsonCache('api', key)
	if (json) setData(json)
	json = await getApi(config, path, query, true)
		.then((json) => {
			setData(json)
			return json
		})
		.catch(() => { return null })
	await setJsonCache('api', key, json)
}

export const useCachedAndApi = (initialState, path, query = '', setFunc = () => { }, deps = []) => {
	const config = React.useContext(ConfigContext)
	const [data, setData] = React.useState(initialState)

	React.useEffect(() => {
		getCachedAndApi(config, path, query, (json) => {
			setFunc(json, setData)
		})
	}, [config, ...deps])

	return data
}

export const getApiCacheFirst = (config, path, query = '') => {
	return new Promise((resolve, reject) => {
		const key = getUrl(config, path, query)
		getJsonCache('api', key)
			.then((json) => {
				if (json) return resolve(json)
				getApi(config, path, query)
					.then((json) => {
						setJsonCache('api', key, json)
							.then(() => {
								resolve(json)
							})
					})
					.catch((error) => reject(error))
			})
			.catch(() => {
				getApi(config, path, query)
					.then((json) => {
						setJsonCache('api', key, json)
							.then(() => {
								resolve(json)
							})
					})
					.catch((error) => reject(error))
			})
	})
}

export const getApiNetworkFirst = (config, path, query = '') => {
	return new Promise((resolve, reject) => {
		const key = getUrl(config, path, query)
		getApi(config, path, query)
			.then((json) => {
				setJsonCache('api', key, json)
					.then(() => resolve(json))
			})
			.catch((error) => {
				getJsonCache('api', getUrl(config, path, query))
					.then((json) => {
						if (json) resolve(json)
						else reject(error)
					})
					.catch((error) => reject(error))
			})
	})
}

export const urlCover = (config, id, size = null) => {
	if (id === 'tuktuktuk') return 'https://github.com/sawyerf/Castafiore/blob/main/assets/icon.png?raw=true'
	if (!config?.url || !config?.query) return null
	if (!id) return null
	if (!size) {
		return `${config.url}/rest/getCoverArt?id=${id}&${config.query}`
	}
	return `${config.url}/rest/getCoverArt?id=${id}&size=${size}&${config.query}`
}

export const urlStream = (config, id) => {
	if (!id.match(/^[a-z0-9]*$/)) return id
	return `${config.url}/rest/stream?id=${id}&${config.query}`
}