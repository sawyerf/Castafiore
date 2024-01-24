import { View, Text, TextInput } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import IconButton from '~/components/button/IconButton'
import theme from '~/utils/theme'
import presStyles from '~/styles/pres'

const Header = ({ title }) => {
	const navigation = useNavigation()

	return (
		<View
			style={{
				flexDirection: 'row',
				width: '100%',
			}} >
			<IconButton
				icon="chevron-left"
				size={23}
				color={theme.primaryLight}
				style={{ padding: 20, alignItems: 'center' }}
				onPress={() => navigation.goBack()}
			/>
			<Text style={{ ...presStyles.title, marginStart: 0, width: undefined }}>{title}</Text>
		</View>
	)
}

export default Header;