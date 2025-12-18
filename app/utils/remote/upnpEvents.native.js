import { EventEmitter } from 'events'

const upnpEventEmitter = new EventEmitter()
upnpEventEmitter.setMaxListeners(20)

export const Events = {
	STATE_CHANGED: 'stateChanged',
	TRACK_ADDED: 'trackAdded',
	TRACK_ENDED: 'trackEnded',
	PROGRESS_CHANGED: 'progressChanged'
}

const addListener = (event, listener) => {
	upnpEventEmitter.on(event, listener)
	return () => {
		upnpEventEmitter.off(event, listener)
	}
}

const emit = (event, payload) => {
	return upnpEventEmitter.emit(event, payload)
}

const listenerCount = (event) => {
	return upnpEventEmitter.listenerCount(event)
}


export default {
	addListener,
	emit,
	listenerCount,

}
// Events: 
// 'stateChanged' - payload: { device, state }
// 'trackAdded' - payload: { device, track }
// 'trackEnded' - payload: { device }
// 'progressChanged' - payload: { device, position, duration }
