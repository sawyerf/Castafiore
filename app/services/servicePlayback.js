import TrackPlayer, { Event } from "react-native-track-player"

import Player from "~/utils/player"
import { getApi } from "~/utils/api"
import { getCacheSong, downloadNextSong } from "~/utils/player"

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
				console.log(activeTrack.url)
				getCacheSong(activeTrack.id)
					.then((fileUri) => {
						if (!fileUri) return
						console.log('Cached song: ', fileUri)
						TrackPlayer.load({
							...activeTrack,
							url: fileUri,
						})
					})
					.catch(() => { })
			}

			downloadNextSong(await TrackPlayer.getQueue(), event.index)
				.catch((error) => console.log('downloadNextSong error: ', error))
			// TODO: not trigger it two times
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
