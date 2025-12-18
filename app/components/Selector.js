import React from 'react'
import { ScrollView, Pressable, Text } from 'react-native'
import { ThemeContext } from '~/contexts/theme'

const Selector = ({ current, items, setData }) => {
	const theme = React.useContext(ThemeContext)

	return (
		<ScrollView
			horizontal={true}
			showsHorizontalScrollIndicator={false}
			style={{ marginBottom: 30, flex: 1 }}
			contentContainerStyle={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20 }}
		>
			{items.map((item, index) => (
				<Pressable
					key={index}
					style={{
						paddingVertical: 7,
						paddingHorizontal: 15,
						borderRadius: 20,
						backgroundColor: current === item ? theme.primaryTouch : theme.secondaryBack,
					}}
					onPress={() => setData(item)}>
					<Text style={{ color: current === item ? theme.innerTouch : theme.primaryText }}>
						{typeof item === 'string' ? item.charAt(0).toUpperCase() + item.slice(1) : item}
					</Text>
				</Pressable>
			))}
		</ScrollView>
	)
}

export default Selector