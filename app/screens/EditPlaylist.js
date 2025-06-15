import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { ConfigContext } from '~/contexts/config';
import { getApi, urlCover } from '~/utils/api';
import { refreshApi } from '~/utils/api';
import { SetUpdateApiContext } from '~/contexts/updateApi';
import { ThemeContext } from '~/contexts/theme';
import ImageError from '~/components/ImageError';
import BackButton from '~/components/button/BackButton';
import ButtonSwitch from '~/components/settings/ButtonSwitch';
import ButtonText from '~/components/settings/ButtonText';
import mainStyles from '~/styles/main';
import OptionInput from '~/components/settings/OptionInput';
import OptionText from '~/components/settings/OptionText';
import presStyles from '~/styles/pres';
import settingStyles from '~/styles/settings';

const Playlist = ({ route: { params } }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const navigation = useNavigation();
	const setUpdateApi = React.useContext(SetUpdateApiContext);
	const [name, setName] = React.useState('');
	const [isPublic, setIsPublic] = React.useState(false);
	const [comment, setComment] = React.useState('');
	const [isLoaded, setIsLoaded] = React.useState(false);

	React.useEffect(() => {
		getApi(config, 'getPlaylist', `id=${params.playlist.id}`)
			.then(json => {
				setIsLoaded(true);
				setName(json?.playlist?.name || '');
				setIsPublic(json?.playlist?.public || false);
				setComment(json?.playlist?.comment || '');
			})
			.catch(() => { });
	}, []);

	const pushEdit = () => {
		getApi(config, 'updatePlaylist', {
			playlistId: params.playlist.id,
			name: name,
			public: isPublic,
			comment: comment || '\n',
		})
			.then(() => {
				refreshApi(config, 'getPlaylists', null)
					.then(() => {
						setUpdateApi({ path: 'getPlaylists', query: null, uid: 1 });
					});
				navigation.goBack();
			})
			.catch(() => { });
	}

	return (
		<ScrollView
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={[mainStyles.contentMainContainer(insets, false)]}
		>
			<BackButton />
			<ImageError
				style={[presStyles.cover, { backgroundColor: theme.secondaryBack }]}
				source={{ uri: urlCover(config, params.playlist) }}
			/>
			<View style={[settingStyles.contentMainContainer, { marginTop: 30 }]}>
				{
					isLoaded && (
						<>
							<View style={[settingStyles.optionsContainer(theme)]}>
								<OptionInput
									title="Name"
									placeholder="Name"
									value={name}
									placeholderTextColor={theme.primaryText}
									onChangeText={name => setName(name)}
								/>
								<ButtonSwitch
									title="Public"
									value={isPublic}
									onPress={() => setIsPublic(!isPublic)}
									isLast
								/>
							</View>
							<Text style={settingStyles.titleContainer(theme)}>Description</Text>
							<View style={[settingStyles.optionsContainer(theme), { marginBottom: 10 }]}>
								<OptionText
									placeholder="Comment"
									value={comment}
									placeholderTextColor={theme.primaryText}
									onChangeText={comment => setComment(comment)}
									isLast
								/>
							</View>
							<ButtonText
								text="Save"
								onPress={pushEdit}
							/>
						</>
					)
				}
			</View>
		</ScrollView>
	);
}

export default Playlist;