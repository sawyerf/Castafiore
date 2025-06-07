import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

import { ThemeContext } from '~/contexts/theme';
import BackButton from '~/components/button/BackButton';
import Icon from 'react-native-vector-icons/FontAwesome';
import presStyles from '~/styles/pres';

const PresHeaderIcon = ({ title, subTitle, icon, children = null }) => {
	const theme = React.useContext(ThemeContext);

	return (
		<>
			<BackButton />
			<View style={styles.cover}>
				<Icon name={icon} size={100} color={'#cd1921'} />
			</View>
			<View style={presStyles.headerContainer}>
				<View style={{ flex: 1 }}>
					<Text style={presStyles.title(theme)}>{title}</Text>
					<Text style={presStyles.subTitle(theme)}>{subTitle}</Text>
				</View>
				{children}
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	cover: {
		width: "100%",
		height: 300,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#c68588',
	},
})

export default PresHeaderIcon;