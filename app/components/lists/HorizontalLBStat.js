import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

import { ThemeContext } from '~/contexts/theme';

const HorizontalLBStat = ({ stats }) => {
	const theme = React.useContext(ThemeContext)
	const [maxCount, setMaxCount] = React.useState(0)

	React.useEffect(() => {
		let maxCount = 1;
		stats?.forEach((stat) => {
			if (stat.listen_count > maxCount) maxCount = stat.listen_count
		})
		setMaxCount(maxCount)
	}, [stats])

	return (
		<View style={styles.scrollContainer(stats?.length)} >
			{
				stats.map((item, index) => {
					const time = new Date(item.time_range)

					return (
						<View
							key={index}
							style={{
								flexDirection: 'column-reverse',
								alignItems: 'center',
								flex: 1,
							}}>
							<Text style={{ color: theme.primaryLight, fontSize: 12, textAlign: 'center' }}>{time.getDate()}</Text>
							<View
								style={{
									height: (item.listen_count / maxCount) * 120,
									width: '100%',
									backgroundColor: theme.primaryTouch,
								}}
							/>
							<Text style={{ color: theme.secondaryLight, fontSize: 10, textAlign: 'center' }}>{item.listen_count}</Text>
						</View>
					)
				})
			}
		</View>
	)
}

const styles = StyleSheet.create({
	custScroll: {
		width: '100%',
	},
	scrollContainer: length => ({
		display: 'flex',
		width: '100%',
		maxWidth: length * 60,
		paddingStart: 20,
		paddingEnd: 20,
		flexDirection: 'row',
		columnGap: 10,
		rowGap: 10,
	}),
})

export default HorizontalLBStat;