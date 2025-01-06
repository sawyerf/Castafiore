import { Platform, StyleSheet } from "react-native";
import size from "~/styles/size";

export default StyleSheet.create({
	mainContainer: (theme) => ({
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
		fontSize: size.title.medium,
		fontWeight: 'bold',
		margin: 20,
		marginTop: 30
	}),
	subTitle: theme => ({
		color: theme.primaryLight,
		fontSize: size.title.small,
		fontWeight: 'bold',
	}),
	titleSection: theme => ({
		color: theme.primaryLight,
		fontSize: size.title.small,
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
	},
	coverSmall: theme => ({
		height: size.image.small,
		width: size.image.small,
		// marginStart: 10,
		borderRadius: 4,
		backgroundColor: theme.secondaryDark,
	}),
	icon: {
		width: size.image.small,
		height: size.image.small,
		borderRadius: 10,
		marginEnd: 10
	},
	opacity: ({ pressed }) => ({
		opacity: pressed ? 0.5 : 1,
	}),
})