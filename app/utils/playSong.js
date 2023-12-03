import { Audio } from 'expo-av';

// TODO: Solve Unhandle Promise Rejection Warning
const sound = new Audio.Sound()

export const playSong = async (streamUrl) => {
	await sound.unloadAsync()
	await sound.loadAsync({ uri: streamUrl })
	sound.playAsync()
}

export const pauseSong = async () => {
	await sound.pauseAsync()
}