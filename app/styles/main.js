import theme from '~/utils/theme';

export default {
	mainContainer: (insets) => ({
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
	mainTitle: { color: theme.primaryLight, fontSize: 30, fontWeight: 'bold', margin: 20, marginTop: 30 },
	subTitle: {
		color: theme.primaryLight,
		fontSize: 25,
		fontWeight: 'bold',
	},
	stdVerticalMargin: {
		marginStart: 20,
		marginEnd: 20,
	},
	inputSetting: {
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
	},
}