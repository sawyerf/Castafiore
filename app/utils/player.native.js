import TrackPlayer, { AppKilledPlaybackBehavior, Capability, RepeatMode, State } from "react-native-track-player"
import { getApi, urlCover, urlStream } from './api';

export const initService = async () => {
  TrackPlayer.registerPlaybackService(() => require('../services/servicePlayback'));
}

export const initPlayer = async (songDispatch) => {
  songDispatch({ type: 'init' })
  await TrackPlayer.setupPlayer()
    .catch((error) => {
      console.error('initPlayer: ', error)
    })
  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification
    },
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo
    ],
    notificationCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo
    ],
    progressUpdateEventInterval: -1,
    icon: require('../../assets/icon.png')
  })
  const queue = await TrackPlayer.getQueue()
  if (queue.length > 0) {
    const index = await TrackPlayer.getActiveTrackIndex()
    const isPlaying = await TrackPlayer.getPlaybackState() !== State.Paused

    songDispatch({ type: 'setPlaying', isPlaying })
    songDispatch({ type: 'setSong', queue, index })
  } else {
    setRepeat(songDispatch, 'next')
  }
}

export const previousSong = async (config, song, songDispatch) => {
  await TrackPlayer.skipToPrevious()
  songDispatch({ type: 'previous' })
}

export const nextSong = async (config, song, songDispatch) => {
  await TrackPlayer.skipToNext()
  songDispatch({ type: 'next' })
}

export const pauseSong = async () => {
  await TrackPlayer.pause()
}

export const resumeSong = async () => {
  await TrackPlayer.play()
}

export const playSong = async (config, songDispatch, queue, index) => {
  const track = queue[index]
  const tracks = queue.map((track) => {
    return {
      ...track,
      id: track.id,
      url: urlStream(config, track.id),
      atwork: urlCover(config, track.albumId),
      artist: track.artist,
      title: track.title,
      album: track.album,
      description: '',
      date: '',
      genre: '',
      rating: false,
      duration: track.duration,
      type: 'default',
      isLiveStream: false,
      config
    }
  })
  await TrackPlayer.setQueue(tracks)
  await TrackPlayer.skip(index)
  await TrackPlayer.play()
  songDispatch({ type: 'setSong', queue, index })
  setRepeat(songDispatch, 'next')
  songDispatch({ type: 'setPlaying', isPlaying: true })
}

export const secondToTime = (second) => {
  if (!second) return '00:00'
  return `${String((second - second % 60) / 60).padStart(2, '0')}:${String((second - second % 1) % 60).padStart(2, '0')}`
}

export const setPosition = async (position) => {
  await TrackPlayer.seekTo(position)
}

export const setVolume = async (volume) => {
  if (volume > 1) volume = 1
  if (volume < 0) volume = 0
  await TrackPlayer.setVolume(volume)
}

export const getVolume = () => {
  return TrackPlayer.getVolume()
}

export const setRepeat = async (songdispatch, action) => {
  songdispatch({ type: 'setActionEndOfSong', action })
  TrackPlayer.setRepeatMode(action === 'repeat' ? RepeatMode.Track : RepeatMode.Queue)
}

export const unloadSong = async () => { }
export const tuktuktuk = async (songDispatch) => {
  const urlTuk = 'https://sawyerf.github.io/tuktuktuk.mp3'
  const playingState = await TrackPlayer.getPlaybackState()

  if ([State.Paused, State.Ended, State.Stopped, State.None].indexOf(playingState.state) > -1) {
    const queue = [{
      id: 'tuktuktuk',
      albumId: 'tuktuktuk',
      url: urlTuk,
      title: 'Tuk Tuk Tuk',
      album: 'Tuk Tuk Tuk',
      artist: 'Sawyerf',
      artwork: require('../../assets/icon.png')
    },
    {
      id: 'tuktuktukend',
      albumId: 'tuktuktuk',
      url: urlTuk,
      title: 'Tuk Tuk Tuk',
      artist: 'Sawyerf',
      artwork: require('../../assets/icon.png')
    }]
    await TrackPlayer.setQueue(queue)
    // await TrackPlayer.skip(0)
    await TrackPlayer.play()
    songDispatch({ type: 'setSong', queue, index: 0 })
    setRepeat(songDispatch, 'next')
    songDispatch({ type: 'setPlaying', isPlaying: false })
  }
}

export const updateVolume = (setVolume) => { }
export const updateTime = (setTime) => { }
