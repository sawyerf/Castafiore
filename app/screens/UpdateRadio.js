import React from 'react';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/contexts/config';
import { getApi } from '~/utils/api';
import { ThemeContext } from '~/contexts/theme';
import OptionInput from '~/components/settings/OptionInput';
import Header from '~/components/Header';
import mainStyles from '~/styles/main';
import settingStyles from '~/styles/settings';
import ButtonText from '~/components/settings/ButtonText';

const UpdateRadio = ({ navigation, route }) => {
	const theme = React.useContext(ThemeContext)
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const [name, setName] = React.useState('');
	const [streamUrl, setStreamUrl] = React.useState('');
	const [homePageUrl, setHomePageUrl] = React.useState('');
	const [error, setError] = React.useState('');

	React.useEffect(() => {
		if (route.params?.name) setName(route.params.name)
		if (route.params?.streamUrl) setStreamUrl(route.params.streamUrl)
		if (route.params?.homePageUrl) setHomePageUrl(route.params.homePageUrl)
	}, [])

	const updateRadio = () => {
		if (!name || !streamUrl) return
		if (!route.params?.id) {
			getApi(config, 'createInternetRadioStation', { name, streamUrl, homepageUrl: homePageUrl, })
				.then((data) => {
					navigation.goBack()
				})
				.catch((error) => {
					if (error.isApiError) setError(error.message)
					else setError('Failed to connect to server')
				})
		} else {
			getApi(config, 'updateInternetRadioStation', { id: route.params.id, name, streamUrl, homepageUrl: homePageUrl, })
				.then((data) => {
					navigation.goBack()
				})
				.catch((error) => {
					if (error.isApiError) setError(error.message)
					else setError('Failed to connect to server')
				})
		}
	}

	return (
		<View style={mainStyles.mainContainer(insets, theme)} >
			<Header title={route.params?.id ? 'Update Radio' : 'Create Radio'} />
			<View style={settingStyles.contentMainContainer(insets)}>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'center',
						width: '100%',
						minHeight: 60,
						alignItems: 'center',
					}}
				>
					<Text style={{ color: theme.primaryTouch, paddingBottom: 20 }} color={theme.primaryLight}>{error}</Text>
				</View>
				<View style={settingStyles.optionsContainer(theme)}>
					<OptionInput
						title="Name"
						placeholder="Name"
						placeholderTextColor="#888"
						value={name}
						onChangeText={setName}
						autoCorrect={false}
						autoFocus={true}
					/>
					<OptionInput
						title="Stream url"
						placeholder="Stream url"
						placeholderTextColor="#888"
						value={streamUrl}
						onChangeText={setStreamUrl}
						inputMode="url"
						autoCorrect={false}
					/>
					<OptionInput
						title="Home page url"
						placeholder="Home page url"
						placeholderTextColor="#888"
						value={homePageUrl}
						onChangeText={setHomePageUrl}
						inputMode="url"
						autoCorrect={false}
						onSubmitEditing={updateRadio}
						isLast={true}
					/>
				</View>
				<ButtonText
					text={route.params?.id ? 'Update' : 'Create'}
					onPress={updateRadio}
					disabled={!name || !streamUrl}
				/>
			</View>
		</View>
	)
}

const styles = {
	textInput: theme => ({
		color: theme.secondaryLight,
		fontSize: 20,
		width: '90%',
		marginBottom: 10,
		marginStart: 35,
		fontWeight: 'bold',
		textAlign: 'left',
	})
}
export default UpdateRadio;