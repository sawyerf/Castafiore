import { Platform } from "react-native"

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
		padding: 20,
		...Platform.select({
			web: {
				flex: 'initial',
			},
			android: {
				justifyContent: 'start',
			},
		})
	},
	headerContainer: {
		flexDirection: 'row',
		// alignItems: 'center',
		// justifyContent: 'space-between',
		width: '100%',
		maxWidth: '100%',
	},
}