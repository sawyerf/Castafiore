import { configureBaseUrl } from '~/utils/remote/headlessApi'

configureBaseUrl(() => global.headlessUrl)

export {
	initPlayer,
	useEvent,
	loadSong,
	pauseSong,
	resumeSong,
	stopSong,
	setPosition,
	setVolume,
	getVolume,
	updateTime,
	updateVolume,
	saveState,
	resetAudio,
	isVolumeSupported,
	downloadSong,
	downloadNextSong,
	unloadSong,
	tuktuktuk,
	reload,
	disconnect,
} from '~/utils/remote/headlessApi'
