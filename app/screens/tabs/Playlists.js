import React from 'react';
import { Text, View, TextInput, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import theme from '~/utils/theme';
import SongsList from '~/components/SongsList';
import VerticalPlaylist from '~/components/VerticalPlaylist';
import mainStyles from '~/styles/main';
import { ConfigContext } from '~/utils/config';
import { getApi } from '~/utils/api';
import IconButton from '~/components/button/IconButton';


const Playlists = ({ navigation }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const [favorited, setFavorited] = React.useState([]);
	const [playlists, setPlaylists] = React.useState([]);
	const [refreshing, setRefreshing] = React.useState(false);
	const [newPlaylist, setNewPlaylist] = React.useState(null);
	const [isPublic, setIsPublic] = React.useState(false);

	const onRefresh = () => {
		if (refreshing) return;
		setRefreshing(true);
		getFavorited()
		getPlaylists()
	};

	const getFavorited = () => {
		getApi(config, 'getStarred')
			.then((json) => {
				setFavorited(json.starred.song)
				setRefreshing(false);
			})
			.catch((error) => { setRefreshing(false); })
	}

	const getPlaylists = () => {
		getApi(config, 'getPlaylists')
			.then((json) => {
				setPlaylists(json.playlists.playlist)
				setRefreshing(false);
			})
			.catch((error) => { setRefreshing(false); })
	}

	React.useEffect(() => {
		if (config.url) {
			getFavorited()
			getPlaylists()
		}
	}, [config])

	const addPlaylist = () => {
		if (!newPlaylist?.length) return
		getApi(config, 'createPlaylist', `name=${newPlaylist}`)
			.then((json) => {
				setNewPlaylist(null)
				getPlaylists()
				setIsPublic(false)
			})
			.catch((error) => { })
	}

	return (
		<ScrollView
			vertical={true}
			style={{
				...mainStyles.mainContainer(insets),
			}}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
			refreshControl={(Platform.OS === 'ios' || Platform.OS === 'android') ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primaryLight} /> : null}
		>
			<Text style={mainStyles.mainTitle}>Your Playlists</Text>
			<TouchableOpacity style={styles.subTitleParent} onPress={() => navigation.navigate('Favorited', { favorited })}>
				<Text style={mainStyles.subTitle}><Icon name="heart" size={23} color={theme.primaryTouch} /> Favorited</Text>
				<Text style={{ color: theme.secondaryLight, fontWeight: 'bold', fontSize: 15 }}>
					{favorited?.length} <Icon name="chevron-right" size={15} color={theme.secondaryLight} />
				</Text>
			</TouchableOpacity>
			<SongsList songs={favorited?.slice(0, 3)} config={config} listToPlay={favorited} />
			<View style={styles.subTitleParent}>
				{
					newPlaylist !== null ?
						<>
							<TextInput
								style={{
									height: 40,
									borderColor: 'gray',
									borderWidth: 1,
									borderRadius: 6,
									color: theme.primaryLight,
									// marginEnd: 10,
									flex: 1,
									paddingHorizontal: 10
								}}
								onSubmitEditing={() => addPlaylist()}
								autoFocus={true}
								onChangeText={text => setNewPlaylist(text)}
								value={newPlaylist}
							/>
							<IconButton
								icon={isPublic ? 'globe' : 'lock'}
								color={theme.primaryTouch}
								onPress={() => setIsPublic(!isPublic)}
								style={{ padding: 10, paddingStart: 15, width: 10 + 15 + 20, flex: 'initial' }} />
							<IconButton
								icon={newPlaylist?.length > 0 ? 'plus' : 'times'}
								size={20}
								color={theme.secondaryLight}
								style={{ padding: 10, flex: 'initial' }}
								onPress={() => newPlaylist?.length > 0 ? addPlaylist() : setNewPlaylist(null)} />
						</> :
						<>
							<Text style={{ ...mainStyles.subTitle, flex: 1 }}><Icon name="heart" size={23} color={theme.primaryTouch} /> Playlists</Text>
							<IconButton
								icon="plus"
								size={20}
								color={theme.secondaryLight}
								style={{ padding: 10, flex: 'initial' }}
								onPress={() => newPlaylist?.length > 0 ? addPlaylist() : setNewPlaylist('')} />
						</>
				}
			</View>
			<VerticalPlaylist playlists={playlists} config={config} />
		</ScrollView>
	)
}

const styles = {
	subTitleParent: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		// alignItems: 'center',
		marginTop: 20,
		marginBottom: 20,
		...mainStyles.stdVerticalMargin
	},
}

export default Playlists;