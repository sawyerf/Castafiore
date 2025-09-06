import TrackPlayer, { Event, State } from "react-native-track-player"

import Player from "~/utils/player"
import { getApi } from "~/utils/api"
import { downloadNextSong } from "~/utils/player"
import { songReducer } from "~/contexts/song"
import logger from "~/utils/logger"

let lockDownload = false
let lastScrobble = {
	id: null,
	time: 0,
}
let shouldPlay = false
let pauseTimer = null

const fakeSongDispatch = (action) => {
	songReducer(global.song, action)
}

module.exports = async () => {
	TrackPlayer.addEventListener(Event.RemotePlay, () => Player.resumeSong())
	TrackPlayer.addEventListener(Event.RemotePause, () => Player.pauseSong())
	TrackPlayer.addEventListener(Event.RemoteNext, () => Player.nextSong(global.config, global.song, fakeSongDispatch))
	TrackPlayer.addEventListener(Event.RemotePrevious, () => Player.previousSong(global.config, global.song, fakeSongDispatch))
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
	TrackPlayer.addEventListener(Event.PlaybackQueueEnded, (_event) => {
		if (!global.song?.queue?.length) return
		getApi(global.config, 'scrobble', `id=${global.song.songInfo.id}&submission=true`)
			.catch(() => { })
		if (global.song.actionEndOfSong === 'repeat') {
			TrackPlayer.seekTo(0)
			TrackPlayer.play()
		} else Player.nextSong(global.config, global.song, fakeSongDispatch)
	})
	TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event) => {
		if (event.track?.id === 'tuktuktukend') {
			await TrackPlayer.remove([0, 1])
		} else {
			if (!lockDownload) {
				lockDownload = true
				downloadNextSong(global.song.queue, global.song.index)
					.then(() => {
						lockDownload = false
					})
					.catch((error) => {
						lockDownload = false
						logger.error('downloadNextSong', error)
					})
			}

			if (event.track) {
				const now = Date.now()
				if (lastScrobble.id !== event.track.id || now - lastScrobble.time > 10 * 1000) {
					getApi(global.config, 'scrobble', `id=${event.track.id}&submission=false`)
						.catch(() => { })
					lastScrobble = {
						id: event.track.id,
						time: now,
					}
				}
			}
		}
	})
	TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
		logger.error('PlaybackError', error.code, error.message)
	})
}
