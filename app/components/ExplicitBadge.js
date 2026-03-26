import React from 'react'
import { View, Text } from 'react-native'

const ExplicitBadge = ({ status, color, style }) => {
	if (status !== 'explicit' && status !== 'clean') {
		return null
	}

	return (
		<View style={[{borderWidth: 1, borderColor: color, borderRadius: 2, width: 13, height: 13, justifyContent: 'center', alignItems: 'center', marginRight: 5}]}>
			<Text style={{color: color, fontSize: 9, fontWeight: 'bold', includeFontPadding: false}}>
				{status === 'explicit' ? 'E' : 'C'}
			</Text>
		</View>
	)
}

export default ExplicitBadge
