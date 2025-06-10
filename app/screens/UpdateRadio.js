import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext } from '~/contexts/config';
import { getApi } from '~/utils/api';
import { ThemeContext } from '~/contexts/theme';
import OptionInput from '~/components/settings/OptionInput';
import Header from '~/components/Header';
import mainStyles from '~/styles/main';
import settingStyles from '~/styles/settings';
import ButtonText from '~/components/settings/ButtonText';
import size from '~/styles/size';

const UpdateRadio = ({ navigation, route: { params } }) => {
	const theme = React.useContext(ThemeContext)
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const [name, setName] = React.useState('');
	const [streamUrl, setStreamUrl] = React.useState('');
	const [homePageUrl, setHomePageUrl] = React.useState('');
	const [error, setError] = React.useState('');

	React.useEffect(() => {
		if (params?.name) setName(params.name)
		if (params?.streamUrl) setStreamUrl(params.streamUrl)
		if (params?.homePageUrl) setHomePageUrl(params.homePageUrl)
	}, [])

	const updateRadio = () => {
		if (!name || !streamUrl) return
		if (!params?.id) {
			getApi(config, 'createInternetRadioStation', { name, streamUrl, homepageUrl: homePageUrl, })
				.then(() => { navigation.goBack() })
				.catch((error) => {
					if (error.isApiError) setError(error.message)
					else setError('Failed to connect to server')
				})
		} else {
			getApi(config, 'updateInternetRadioStation', { id: params.id, name, streamUrl, homepageUrl: homePageUrl, })
				.then(() => { navigation.goBack() })
				.catch((error) => {
					if (error.isApiError) setError(error.message)
					else setError('Failed to connect to server')
				})
		}
	}

	return (
		<View style={[
			mainStyles.mainContainer(theme),
			mainStyles.contentMainContainer(insets)
		]}>
			<Header title={params?.id ? 'Update Radio' : 'Create Radio'} />

			<View style={[settingStyles.contentMainContainer, { marginTop: 30 }]}>
				<View style={settingStyles.optionsContainer(theme)}>
					<View style={{ flexDirection: 'column', alignItems: 'center', width: '100%', minHeight: 60, marginTop: 20, paddingBottom: 20 }}>
						<View
							style={{
								aspectRatio: 1,
								backgroundColor: theme.primaryTouch,
								borderRadius: 5,
								alignItems: 'center',
								justifyContent: 'center',
								padding: 10,
							}}>
							<Icon name="feed" size={size.icon.large} color={theme.innerTouch} />
						</View>
						<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
							{/* {!error.length && <Icon name="circle" size={10} color={info ? 'green' : 'red'} />} */}
							<Text style={{ color: error.length ? '#ff0000' : theme.primaryText, fontSize: size.text.medium, marginStart: 5 }}>
								{error || 'Enter radio details'}
							</Text>
						</View>
					</View>
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
						isLast
					/>
				</View>
				<ButtonText
					text={params?.id ? 'Update' : 'Create'}
					onPress={updateRadio}
					disabled={!name || !streamUrl}
				/>
			</View>
		</View>
	)
}

export default UpdateRadio;