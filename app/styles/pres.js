import theme from '../utils/theme'

export default {
	cover: {
		width: "100%",
		height: 300,
	},
	title: {
		color: theme.primaryLight,
		fontSize: 30,
		fontWeight: 'bold',
		margin: 20,
		marginBottom: 0,
		marginTop: 13,
	},
	subTitle: {
		color: theme.secondaryLight,
		fontSize: 20,
		marginBottom: 30,
		marginStart: 20,
	},
	button: {
		position: 'absolute',
		top: 0,
		right: 0,
		margin: 20,
	},
	headerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
}