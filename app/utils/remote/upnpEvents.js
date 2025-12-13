import { EventEmitter } from 'events'

export const upnpEventEmitter = new EventEmitter()
upnpEventEmitter.setMaxListeners(20)

export const UPNP_EVENTS = {
	STATE_CHANGED: 'stateChanged',
	TRACK_ENDED: 'trackEnded',
}

// Events: 
// 'stateChanged' - payload: { device, state }
// 'trackEnded' - payload: { device }