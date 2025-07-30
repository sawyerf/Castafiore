import TrackPlayer, { Event, State } from "react-native-track-player"

import Player from "~/utils/player"
import { getApi } from "~/utils/api"
import { downloadNextSong } from "~/utils/player"
import { isSongCached, getPathSong } from "~/utils/cache"

let lockDownload = false
let lastScrobble = {
	id: null,
	time: 0,
}
let shouldPlay = false
let pauseTimer = null

module.exports = async () => {
	TrackPlayer.addEventListener(Event.RemotePlay, () => Player.resumeSong())
	TrackPlayer.addEventListener(Event.RemotePause, () => Player.pauseSong())
	TrackPlayer.addEventListener(Event.RemoteNext, () => {
		console.log("RemoteNext event triggered", global.song)
		Player.nextSong(global.config, global.song, global.songDispatch)
	})
	TrackPlayer.addEventListener(Event.RemotePrevious, () => Player.previousSong(global.config, global.song, global.songDispatch))
	TrackPlayer.addEventListener(Event.RemoteSeek, (event) => Player.setPosition(event.position))
	// This handles the interruptions like calls or notifications
	TrackPlayer.addEventListener(Event.RemoteDuck, (event) => {
		clearTimeout(pauseTimer)
		TrackPlayer.getPlaybackState()
			.then(({ state }) => {
				if (event.paused) {
					if (state === State.Playing) {
						if (event.permanent) {
							Player.stopSong()
							shouldPlay = false
						} else {
							TrackPlayer.setVolume(0.5)
							shouldPlay = true
							pauseTimer = setTimeout(async () => {
								Player.pauseSong()
							}, 5000)
						}
					}
				}
				else if (shouldPlay) {
					TrackPlayer.setVolume(1)
					Player.resumeSong()
					shouldPlay = false
				}
			})
	})
	TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async (event) => {
		console.log("PlaybackQueueEnded event triggered", event)
		console.log("Current song:", global.song.songInfo)
		Player.nextSong(global.config, global.song, () => {})
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
					getApi(event.lastTrack.config, 'scrobble', `id=${event.lastTrack.id}&submission=true`)
						.catch(() => { })
				}
			}
			if (event.track) {
				const now = Date.now()
				if (lastScrobble.id !== event.track.id || now - lastScrobble.time > 10 * 1000) {
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
