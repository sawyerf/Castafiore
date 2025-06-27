import TrackPlayer, { Event } from "react-native-track-player"

import Player from "~/utils/player"
import { getApi } from "~/utils/api"
import { downloadNextSong } from "~/utils/player"
import { isSongCached, getPathSong } from "~/utils/cache"

let lockDownload = false
let lastScrobble = {
	id: null,
	time: 0,
}

module.exports = async () => {
	TrackPlayer.addEventListener(Event.RemotePlay, () => Player.resumeSong())
	TrackPlayer.addEventListener(Event.RemotePause, () => Player.pauseSong())
	TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext())
	TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious())
	TrackPlayer.addEventListener(Event.RemoteSeek, (event) => Player.setPosition(event.position))
	TrackPlayer.addEventListener(Event.RemoteDuck, (event) => {
		if (event.paused) Player.pauseSong()
		else Player.resumeSong()
	})
	TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event) => {
		if (event.track?.id === 'tuktuktukend') {
			await TrackPlayer.remove([0, 1])
		} else {
			const activeTrack = await TrackPlayer.getActiveTrack()

			if (activeTrack.url.startsWith('http')) {
				if (await isSongCached(null, activeTrack.id, global.streamFormat, global.maxBitRate)) {
					TrackPlayer.load({
						...activeTrack,
						url: getPathSong(activeTrack.id, global.streamFormat),
					})
				}
			}

			if (!lockDownload) {
				lockDownload = true
				downloadNextSong(await TrackPlayer.getQueue(), event.index)
					.then(() => {
						lockDownload = false
					})
					.catch((error) => {
						lockDownload = false
						console.error('downloadNextSong error: ', error)
					})
			}

			if (event.lastTrack) {
				if (event.lastPosition >= event.lastTrack.duration - 1) {
					console.log('scrobbled true', event.lastTrack.id)
					getApi(event.lastTrack.config, 'scrobble', `id=${event.lastTrack.id}&submission=true`)
						.catch(() => { })
				}
			}
			if (event.track) {
				const now = Date.now()
				if (lastScrobble.id !== event.track.id || now - lastScrobble.time > 10 * 1000) {
					console.log('scrobbled false', event.track.id)
					getApi(event.track.config, 'scrobble', `id=${event.track.id}&submission=false`)
						.catch(() => { })
					lastScrobble = {
						id: event.track.id,
						time: now,
					}
				}
			}
		}
	})
}
