import theme from '../utils/theme'

export default {
	cover: {
		flex: 1,
		width: "100%",
		height: 300,
	},
	title: {
		color: theme.primaryLight,
		fontSize: 30,
		fontWeight: 'bold',
		margin: 15,
		marginBottom: 0
	},
	subTitle: { color: theme.secondaryLight, fontSize: 20, marginBottom: 40, marginStart: 15 },
	button: {
		position: 'absolute',
		top: 0,
		right: 0,
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		margin: 15,
	},
	headerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
}