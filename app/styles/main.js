import { StyleSheet } from "react-native";
import size from "~/styles/size";

export default StyleSheet.create({
	mainContainer: (theme) => ({
		flex: 1,
		backgroundColor: theme.primaryBack,
	}),
	contentMainContainer: (insets, statusBar = true) => ({
		paddingTop: statusBar ? insets.top : 0,
		paddingBottom: 80,
		paddingStart: insets.left,
		paddingEnd: insets.right,
	}),
	mainTitle: theme => ({
		color: theme.primaryText,
		fontSize: size.title.medium,
		fontWeight: 'bold',
		margin: 20,
		marginTop: 30
	}),
	subTitle: theme => ({
		color: theme.primaryText,
		fontSize: size.title.small,
		fontWeight: 'bold',
	}),
	titleSection: theme => ({
		color: theme.primaryText,
		fontSize: size.title.small,
		fontWeight: 'bold',
		marginHorizontal: 20,
		marginTop: 25,
		marginBottom: 10
	}),
	stdVerticalMargin: {
		marginHorizontal: 20,
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
		backgroundColor: theme.secondaryBack,
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
	smallText: color => ({
		color: color,
		fontSize: size.text.small,
		textAlign: 'left',
	}),
	mediumText: color => ({
		color: color,
		fontSize: size.text.medium,
		textAlign: 'left',
	}),
	largeText: color => ({
		color: color,
		fontSize: size.text.large,
		textAlign: 'left',
	}),
})