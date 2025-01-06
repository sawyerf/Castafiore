import { StyleSheet } from 'react-native';
import size from '~/styles/size';

export default StyleSheet.create({
	cover: {
		width: "100%",
		height: 300,
	},
	title: theme => ({
		color: theme.primaryLight,
		fontSize: size.title.medium,
		fontWeight: 'bold',
		margin: 20,
		marginBottom: 0,
		marginTop: 13,
	}),
	subTitle: theme => ({
		color: theme.secondaryLight,
		fontSize: size.text.large,
		marginBottom: 30,
		marginStart: 20,
	}),
	button: {
		padding: 20,
		justifyContent: 'start',
	},
	headerContainer: {
		flexDirection: 'row',
		width: '100%',
		maxWidth: '100%',
	},
})