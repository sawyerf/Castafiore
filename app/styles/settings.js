import { StyleSheet } from 'react-native'
import size from '~/styles/size';

export default StyleSheet.create({
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
		fontSize: size.text.small,
		marginStart: 5,
		marginBottom: 20,
		width: '100%',
		textAlign: 'left'
	}),
	contentMainContainer: {
		maxWidth: 800,
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 20,
		paddingStart: 20,
		paddingEnd: 20,
		alignSelf: 'center',
	},
	optionItem: (theme, isLast) => ({
		width: '100%',
		height: 50,
		paddingEnd: 5,
		alignItems: 'center',
		borderBottomColor: theme.secondaryLight,
		borderBottomWidth: isLast ? 0 : .5,
		flexDirection: 'row',
	}),
	primaryText: (theme, style = { flex: 1 }) => ({
		color: theme.primaryLight,
		fontSize: size.text.medium,
		marginEnd: 10,
		...style,
	}),
})