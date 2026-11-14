import TrackPlayer, { Event } from "react-native-track-player"

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
// Resume after the interruption (call...) only if music was playing when it started
let shouldPlay = false

const fakeSongDispatch = (action) => {
	songReducer(global.song, action)
}

module.exports = async () => {
	TrackPlayer.addEventListener(Event.RemotePlay, () => {
		shouldPlay = false
		Player.resumeSong()
	})
	TrackPlayer.addEventListener(Event.RemotePause, () => {
		shouldPlay = false
		Player.pauseSong()
	})
	TrackPlayer.addEventListener(Event.RemoteNext, () => Player.nextSong(global.config, global.song, fakeSongDispatch))
	TrackPlayer.addEventListener(Event.RemotePrevious, () => Player.previousSong(global.config, global.song, fakeSongDispatch))
	TrackPlayer.addEventListener(Event.RemoteSeek, (event) => Player.setPosition(event.position))
	// Interruptions (audio focus).
	// - Call / alarm (transient loss): pause at once, resume when it ends.
	// - Another player takes the focus (permanent loss): pause, no resume.
	// - Notification / navigation voice: ducked natively (alwaysPauseOnInterruption: false), no event to handle.
	TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
		if (event.paused) {
			if (event.permanent) shouldPlay = false
			// playWhenReady: playing, or buffering to play (the state alone misses buffering)
			const isPlaying = await TrackPlayer.getPlayWhenReady().catch(() => false)
			if (!isPlaying) return
			logger.info('Interruption', event.permanent ? 'Focus lost, pause' : 'Call / transient, pause until it ends')
			shouldPlay = !event.permanent
			Player.pauseSong()
		} else if (shouldPlay) {
			shouldPlay = false
			logger.info('Interruption', 'Ended, resume')
			Player.resumeSong()
		}
	})
	TrackPlayer.addEventListener(Event.PlaybackQueueEnded, (_event) => {
		if (!global.song?.queue?.length) return
		if (global.song?.songInfo?.id === 'tuktuktuk') return Player.resetAudio(global.songDispatch)
		getApi(global.config, 'scrobble', { id: global.song.songInfo.id, submission: true })
			.catch(() => { })
		if (global.song.actionEndOfSong === 'repeat') {
			Player.setPosition(0)
			Player.resumeSong()
		} else if (!global.repeatQueue && global.song.index === global.song.queue.length - 1) {
			Player.stopSong()
		} else Player.nextSong(global.config, global.song, fakeSongDispatch)
	})
	TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event) => {
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
				getApi(global.config, 'scrobble', { id: event.track.id, submission: false })
					.catch(() => { })
				lastScrobble = {
					id: event.track.id,
					time: now,
				}
			}
		}
	})
	TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
		logger.error('PlaybackError', error.code, error.message)
	})
}
