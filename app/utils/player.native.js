import TrackPlayer from "react-native-track-player"
import { getApi, urlCover, urlStream } from './api';

export const initService = async () => {
  TrackPlayer.registerPlaybackService(() => require('../services/service'));
}

export const initPlayer = async (songDispatch) => {
  songDispatch({ type: 'init' })
  await TrackPlayer.setupPlayer()
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
  await TrackPlayer.setQueue(queue.map((track) => {
    return {
      ...track,
      url: urlStream(config, track.id),
      atwork: urlCover(config, track.albumId)
    }
  }))
  await TrackPlayer.skip(index)
  await TrackPlayer.play()
  songDispatch({ type: 'setSong', queue, index })
  songDispatch({ type: 'setActionEndOfSong', action: 'next' })
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

export const unloadSong = async () => { }
export const tuktuktuk = () => { }
export const updateVolume = (setVolume) => { }
export const updateTime = (setTime) => { }
