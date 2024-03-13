export default {
	cover: {
		width: "100%",
		height: 300,
	},
	title: theme => ({
		color: theme.primaryLight,
		fontSize: 30,
		fontWeight: 'bold',
		margin: 20,
		marginBottom: 0,
		marginTop: 13,
	}),
	subTitle: theme => ({
		color: theme.secondaryLight,
		fontSize: 20,
		marginBottom: 30,
		marginStart: 20,
	}),
	button: {
		// position: 'absolute',
		// top: 0,
		// right: 0,
		padding: 20,
		// justifyContent: 'center',
		// alignItems: 'center',
		flex: 'initial'
	},
	headerContainer: {
		flexDirection: 'row',
		// alignItems: 'center',
		// justifyContent: 'space-between',
		width: '100%',
		maxWidth: '100%',
	},
}