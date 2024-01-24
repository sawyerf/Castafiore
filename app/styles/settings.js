import theme from '~/utils/theme'
import mainStyles from '~/styles/main'

export default {
	titleContainer: {
		width: '100%',
		sizeFont: 12,
		textTransform: 'uppercase',
		fontWeight: 'bold',
		color: theme.secondaryLight,
		marginBottom: 5,
		marginStart: 10,
	},
	optionsContainer: {
		flexDirection: 'column',
		width: '100%',
		paddingVertical: 1,
		paddingHorizontal: 17,
		backgroundColor: theme.secondaryDark,
		borderRadius: 10,
		marginBottom: 30,
	},
	description: {
		color: theme.secondaryLight,
		fontSize: 13,
		marginStart: 5,
		width: '100%',
		textAlign: 'left'
	},
	contentMainContainer: insets => ({
		...mainStyles.contentMainContainer(insets),
		maxWidth: 800,
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 20,
		alignSelf: 'center',
	}),
	optionItem: isLast => ({
		width: '100%',
		height: 50,
		paddingEnd: 5,
		alignItems: 'center',
		borderBottomColor: theme.secondaryLight,
		borderBottomWidth: isLast ? 0 : .5,
		flexDirection: 'row',
	}),

}