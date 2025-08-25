import React from "react"

import { ConfigContext } from "~/contexts/config"
import { getJsonCache, setJsonCache } from "~/utils/cache"
import { SetUpdateApiContext, UpdateApiContext, isUpdatable } from "~/contexts/updateApi"
import logger from "~/utils/logger"

export const getUrl = (config, path, query = '') => {
	let encodedQuery = ''
	if (typeof query === 'string') {
		encodedQuery = query
	} else if (query === null || query === undefined) {
		encodedQuery = ''
	} else if (typeof query === 'object') {
		encodedQuery = Object.keys(query).map((key) => `${key}=${encodeURIComponent(query[key])}`).join('&')
	} else {
		logger.error('getApi: query is not a string or an object')
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
			.then(res => {
				if (res.status !== 200) {
					reject({ message: `Connection failed (HTTP ${res.status})`, isApiError: false })
					return null
				} else {
					return res.json()
				}
			})
			.then(json => {
				if (!json) {
					reject({ message: 'Connection failed (no response)', isApiError: false })
					return
				}
				if (json['subsonic-response'] && !json['subsonic-response']?.error) {
					resolve(json['subsonic-response'])
				} else {
					logger.error(`getApi[/rest/${path}]: ${JSON.stringify(json['subsonic-response']?.error)}`)
					reject({ ...json['subsonic-response']?.error, isApiError: true })
				}
			})
			.catch((error) => {
				logger.error(`getApi[/rest/${path}]: ${error}`)
				reject({ message: error.message, error, isApiError: false })
			})
	})
}

export const getCachedAndApi = async (config, path, query = '', setData = () => { }) => {
	if (!config?.url || !config?.query) {
		logger.error('getCachedApi: config.url or config.query is not defined')
		return
	}

	let json = null
	const key = getUrl(config, path, query)
	json = await getJsonCache('api', key)
	if (json) setData(json, 'cache')
	json = await getApi(config, path, query, true)
		.then((json) => {
			setData(json, 'api')
			return json
		})
		.catch(() => { return null })
	await setJsonCache('api', key, json)
}

export const refreshApi = (config, path, query = '') => {
	return new Promise((resolve, reject) => {
		getApi(config, path, query)
			.then((json) => {
				setJsonCache('api', getUrl(config, path, query), json)
					.then(() => resolve(json))
			})
			.catch((error) => {
				logger.error(`refreshApi[/rest/${path}]: `, error)
				reject({ ...error, isApiError: false })
			})
	})
}

/**
 * Custom hooks for API data fetching with caching and updates.
 * setFunc is called three times during its lifecycle:
 * 1. Once with cached data (if available).
 * 2. Once with fresh data from the API.
 * 3. Again with cached data when another component fetches the same url.
 * 
 * @param {any} initialState - Initial state for the data.
 * @param {string} path - API endpoint path.
 * @param {string | object} query - Query parameters for the API request.
 * @param {function} setFunc - Function called to set the data state.
 * @param {Array} deps - Dependencies for the effect hook.
 * @return {Array} - Returns an array containing the data, a refresh function, and a setData function. 
 * 
*/
export const useCachedAndApi = (initialState, path, query = '', setFunc = () => { }, deps = []) => {
	const config = React.useContext(ConfigContext)
	const updateApi = React.useContext(UpdateApiContext)
	const setUpdateApi = React.useContext(SetUpdateApiContext)
	const [data, setData] = React.useState(initialState)
	const uid = React.useRef(Date.now())

	const refresh = React.useCallback(() => {
		if (!config?.url || !config?.query) return
		uid.current = Date.now()
		refreshApi(config, path, query)
			.then((json) => {
				setUpdateApi({ path, query, uid: uid.current })
				setFunc(json, setData)
			})
	}, [config, path, query, setFunc, setUpdateApi])

	React.useEffect(() => {
		if (!config?.url || !config?.query) return
		getCachedAndApi(config, path, query, (json, mode) => {
			setFunc(json, setData)
			if (mode === 'api') setUpdateApi({ path, query, uid: uid.current })
		})
	}, [config, ...deps])

	React.useEffect(() => {
		if (!config?.url || !config?.query) setData(initialState)
	}, [config])

	React.useEffect(() => {
		if (!config?.url || !config?.query) return
		if (!isUpdatable(updateApi, path, query)) return
		if (updateApi.uid === uid.current) return

		const key = getUrl(config, path, query)
		getJsonCache('api', key)
			.then((json) => {
				if (json) setFunc(json, setData)
			})
	}, [updateApi])

	return [data, refresh, setData]
}

export const useCachedFirst = (initialState, path, query = '', setFunc = () => { }, deps = []) => {
	const config = React.useContext(ConfigContext)
	const updateApi = React.useContext(UpdateApiContext)
	const [data, setData] = React.useState(initialState)

	React.useEffect(() => {
		if (!config?.url || !config?.query) return
		getApiCacheFirst(config, path, query)
			.then((json) => {
				setFunc(json, setData)
			})
	}, [config, ...deps])

	React.useEffect(() => {
		if (!config?.url || !config?.query) return
		if (!isUpdatable(updateApi, path, query)) return

		const key = getUrl(config, path, query)
		getJsonCache('api', key)
			.then((json) => {
				if (json) setFunc(json, setData)
			})
	}, [updateApi])

	return [data, setData]
}

export const getApiCacheFirst = (config, path, query = '') => {
	return new Promise((resolve, reject) => {
		const key = getUrl(config, path, query)
		getJsonCache('api', key)
			.then((json) => {
				if (json) return resolve(json)
				else getApi(config, path, query)
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
					.catch(() => {
						resolve(json)
					})
			})
			.catch((error) => {
				getJsonCache('api', key)
					.then((json) => {
						if (json) resolve(json)
						else reject(error)
					})
					.catch((error) => reject(error))
			})
	})
}

const realCover = (config, id, size = null) => {
	if (!id) return null
	if (!size) {
		return `${config.url}/rest/getCoverArt?id=${id}&${config.query}`
	}
	return `${config.url}/rest/getCoverArt?id=${id}&size=${size}&${config.query}`
}

export const urlCover = (config, id, size = null) => {
	if (id === 'tuktuktuk') return 'https://github.com/sawyerf/Castafiore/blob/main/assets/icon.png?raw=true'
	if (!config?.url || !config?.query) return null
	if (typeof id === 'object') {
		const item = id

		if (item.homePageUrl && item.homePageUrl.startsWith('http')) {
			return item.homePageUrl + '/favicon.ico'
		}
		if (['artist', 'album', 'playlist'].includes(item.mediaType)) {
			if (['navidrome', 'ampache'].includes(config?.type) || !config?.type) return realCover(config, item.id || item.coverArt, size)
			else return realCover(config, item.coverArt || item.id, size)
		} else if (item.mediaType === 'song') {
			if (['navidrome', 'ampache'].includes(config?.type) || !config?.type) return realCover(config, item.albumId || item.coverArt, size)
			else return realCover(config, item.coverArt || item.albumId || item.id, size)
		} else {
			if (['navidrome', 'ampache'].includes(config?.type) || !config?.type) return realCover(config, item.albumId || item.id || item.coverArt, size)
			else return realCover(config, item.coverArt || item.albumId || item.id, size)
		}
	} else {
		if (id.startsWith('http://') || id.startsWith('https://')) return id
		return realCover(config, id, size)
	}
}

export const urlStream = (config, id, format = 'raw', maxBitRate = 0) => {
	if (!id.match(/^[a-zA-Z0-9-]*$/)) return id
	if (format === 'raw') return `${config.url}/rest/stream?id=${id}&${config.query}`
	return `${config.url}/rest/stream?id=${id}&format=${format}&maxBitRate=${maxBitRate}&${config.query}`
}