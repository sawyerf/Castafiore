export const parseLrc = (lrc) => {
	const lines = lrc.split('\n')
	const lyrics = []
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]
		const time = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\]/)
		if (time) {
			const minutes = parseInt(time[1])
			const seconds = parseInt(time[2])
			const milliseconds = parseInt(time[3])
			const text = line.replace(/\[(\d{2}):(\d{2})\.(\d{2})\]/, '').trim()
			lyrics.push({
				time: minutes * 60 + seconds + milliseconds / 100,
				text
			})
		}
	}
	return lyrics
}