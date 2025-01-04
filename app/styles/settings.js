import mainStyles from '~/styles/main'

export default {
	titleContainer: theme => ({
		width: '100%',
		fontSize: 12,
		textTransform: 'uppercase',
		fontWeight: 'bold',
		color: theme.secondaryLight,
		marginBottom: 5,
		marginStart: 10,
	}),
	optionsContainer: theme => ({
		flexDirection: 'column',
		width: '100%',
		paddingVertical: 1,
		paddingHorizontal: 17,
		backgroundColor: theme.secondaryDark,
		borderRadius: 10,
		marginBottom: 30,
	}),
	description: theme => ({
		color: theme.secondaryLight,
		fontSize: 13,
		marginStart: 5,
		marginBottom: 20,
		width: '100%',
		textAlign: 'left'
	}),
	contentMainContainer: insets => ({
		maxWidth: 800,
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 20,
		paddingStart: 20,
		paddingEnd: 20,
		alignSelf: 'center',
	}),
	optionItem: (theme, isLast) => ({
		width: '100%',
		height: 50,
		paddingEnd: 5,
		alignItems: 'center',
		borderBottomColor: theme.secondaryLight,
		borderBottomWidth: isLast ? 0 : .5,
		flexDirection: 'row',
	}),
	primaryText: theme => ({
		color: theme.primaryLight,
		fontSize: 16,
		marginEnd: 10,
		flex: 1,
	}),
}