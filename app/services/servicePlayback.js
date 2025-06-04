import TrackPlayer, { Event } from "react-native-track-player"

import Player from "~/utils/player"
import { getApi } from "~/utils/api"

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
			if (event.lastTrack) {
				if (event.lastPosition >= event.lastTrack.duration - 1) {
					getApi(event.lastTrack.config, 'scrobble', `id=${event.lastTrack.id}&submission=true`)
						.catch(() => { })
				}
			}
			if (event.track) {
				getApi(event.track.config, 'scrobble', `id=${event.track.id}&submission=false`)
					.catch(() => { })
			}
		}
	})
}
