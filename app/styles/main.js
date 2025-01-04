import { Platform } from "react-native";

export default {
	mainContainer: (insets, theme) => ({
		flex: 1,
		backgroundColor: theme.primaryDark,
	}),
	contentMainContainer: (insets, statusBar = true) => ({
		paddingTop: statusBar ? insets.top : 0,
		paddingBottom: 80 + Platform.select({ web: 0, android: insets.bottom }),
		paddingStart: insets.left,
		paddingEnd: insets.right,
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
	button: {
		flex: 1,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
	}
}