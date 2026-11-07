import React from 'react'
import { AccessibilityInfo } from 'react-native'

// Module flag for plain style helpers, hook for components that must re-render.
let reduced = false
const listeners = new Set()
const set = (value) => {
	reduced = !!value
	listeners.forEach(fn => fn(reduced))
}
AccessibilityInfo.isReduceMotionEnabled?.().then(set).catch(() => { })
AccessibilityInfo.addEventListener?.('reduceMotionChanged', set)

export const isReducedMotion = () => reduced

export const useReducedMotion = () => {
	const [value, setValue] = React.useState(reduced)
	React.useEffect(() => {
		listeners.add(setValue)
		setValue(reduced)
		return () => listeners.delete(setValue)
	}, [])
	return value
}
