const realCover = (config, id, size = null) => {
	if (!id) return null
	if (!size) {
		return `${config.url}/rest/getCoverArt?id=${id}&${config.query}`
	}
	return `${config.url}/rest/getCoverArt?id=${id}&size=${size}&${config.query}`
}

export const urlCover = (config, id, size = null) => {
	if (!id) return null
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