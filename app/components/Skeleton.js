import React from 'react'
import { Animated, Platform, View } from 'react-native'

import { useTheme } from '~/contexts/theme'
import { useReducedMotion } from '~/utils/reducedMotion'
import size from '~/styles/size'

// Pulsing grey block. Static when the system asks for reduced motion.
export const Skeleton = ({ style }) => {
	const theme = useTheme()
	const reduced = useReducedMotion()
	const pulse = React.useRef(new Animated.Value(0.5)).current

	React.useEffect(() => {
		if (reduced) return
		const loop = Animated.loop(Animated.sequence([
			Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
			Animated.timing(pulse, { toValue: 0.5, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
		]))
		loop.start()
		return () => loop.stop()
	}, [reduced])

	return <Animated.View style={[{ backgroundColor: theme.secondaryBack, opacity: reduced ? 0.7 : pulse }, style]} />
}

// Placeholder for a horizontal list while it loads: a title bar and a row of covers.
export const SkeletonRow = () => (
	<View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
		<Skeleton style={{ width: 160, height: 22, borderRadius: size.radius.sm, marginHorizontal: 20, marginTop: 25, marginBottom: 12 }} />
		<View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, overflow: 'hidden' }}>
			{[0, 1, 2, 3].map(i => (
				<View key={i}>
					<Skeleton style={{ width: size.image.large, height: size.image.large, marginBottom: 9 }} />
					<Skeleton style={{ width: size.image.large * 0.8, height: 12, borderRadius: size.radius.sm, marginBottom: 6 }} />
					<Skeleton style={{ width: size.image.large * 0.5, height: 12, borderRadius: size.radius.sm }} />
				</View>
			))}
		</View>
	</View>
)
