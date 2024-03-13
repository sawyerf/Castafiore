export default {
	mainContainer: (insets, theme) => ({
		flex: 1,
		backgroundColor: theme.primaryDark,
		paddingTop: insets.top,
		paddingBottom: insets.bottom,
		paddingLeft: insets.left,
		paddingRight: insets.right,
	}),
	contentMainContainer: (insets) => ({
		// add inset because for screen home for ios and android, the refresh change the height of the screen
		// paddingBottom: insets.bottom + 80
		paddingBottom: 80
	}),
	mainTitle: theme => ({
		color: theme.primaryLight,
		fontSize: 30,
		fontWeight: 'bold',
		margin: 20,
		marginTop: 30
	}),
	subTitle: theme => ({
		color: theme.primaryLight,
		fontSize: 25,
		fontWeight: 'bold',
	}),
	titleSection: theme => ({
		color: theme.primaryLight,
		fontSize: 25,
		fontWeight: 'bold',
		margin: 20,
		marginTop: 25,
		marginBottom: 10
	}),
	stdVerticalMargin: {
		marginStart: 20,
		marginEnd: 20,
	},
	inputSetting: theme => ({
		width: "90%",
		backgroundColor: theme.secondaryDark,
		borderRadius: 25,
		height: 50,
		marginBottom: 20,
		justifyContent: "center",
		paddingHorizontal: 20,
		borderColor: theme.secondaryLight,
		borderWidth: 1,
		color: theme.primaryLight,
	}),
	button: {
		// width: "80%",
		flex: 1,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
	}
}