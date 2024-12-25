import React from 'react';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import { ConfigContext } from '~/contexts/config';
import IconButton from '~/components/button/IconButton';
import { getApi } from '~/utils/api';
import { ThemeContext } from '~/contexts/theme';

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
				<Text style={{ ...presStyles.title(theme), marginStart: 0, width: undefined }}>Update Radio</Text>
			</View>
			<View style={{
				maxWidth: 500,
				width: '100%',
				paddingHorizontal: 20,
				paddingTop: 20,
				alignSelf: 'center',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
			}}
			>
				<Text style={{ color: theme.primaryTouch, paddingBottom: 20 }} color={theme.primaryLight}>{error}</Text>
				{/* {name && <Text style={styles.textInput} >Name</Text>} */}
				<TextInput
					style={mainStyles.inputSetting(theme)}
					placeholder="Name"
					placeholderTextColor="#888"
					value={name}
					onChangeText={setName}
					autoCorrect={false}
					autoFocus={true}
				/>
				{/* {streamUrl && <Text style={styles.textInput} >Url Stream</Text>} */}
				<TextInput
					style={mainStyles.inputSetting(theme)}
					placeholder="URL Stream"
					placeholderTextColor="#888"
					value={streamUrl}
					onChangeText={setStreamUrl}
					inputMode="url"
					autoCorrect={false}
				/>
				{/* {homePageUrl && <Text style={styles.textInput} >Url Home page</Text>} */}
				<TextInput
					style={mainStyles.inputSetting(theme)}
					placeholder="URL Home page"
					placeholderTextColor="#888"
					value={homePageUrl}
					onChangeText={setHomePageUrl}
					inputMode="url"
					autoCorrect={false}
					onSubmitEditing={updateRadio}
				/>
				<TouchableOpacity
					style={{ ...mainStyles.button, flex: undefined, width: '100%' }}
					disabled={!name || !streamUrl}
					onPress={updateRadio}
				>
					<Text style={{
						color: (name && streamUrl) ? theme.primaryTouch : theme.secondaryLight,
					}}>{route.params?.id ? 'Update' : 'Create'}</Text>
				</TouchableOpacity>
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