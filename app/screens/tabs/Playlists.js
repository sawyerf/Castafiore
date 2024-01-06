import React from 'react';
import { Text, View, TextInput, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import theme from '~/utils/theme';
import SongsList from '~/components/lists/SongsList';
import VerticalPlaylist from '~/components/lists/VerticalPlaylist';
import mainStyles from '~/styles/main';
import { ConfigContext } from '~/contexts/config';
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

	React.useEffect(() => {
		if (config.query) {
			getFavorited()
			getPlaylists()
		}
	}, [config])

	React.useEffect(() => {
		if (refreshing) {
			getFavorited()
			getPlaylists()
		}
	}, [refreshing])

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
		// refreshControl={(Platform.OS === 'ios' || Platform.OS === 'android') ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primaryLight} /> : null}
		>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginEnd: 20 }}>
				<Text style={mainStyles.mainTitle}>Your Playlists</Text>
				<IconButton
					icon="refresh"
					size={30}
					color={theme.primaryLight}
					style={{ paddingHorizontal: 10, marginTop: 30, marginBottom: 20 }}
					onPress={() => setRefreshing(true)}
				/>
			</View>
			<TouchableOpacity style={styles.subTitleParent} onPress={() => navigation.navigate('Favorited', { favorited })}>
				<Icon name="heart" size={23} color={theme.primaryTouch} style={{ marginEnd: 10 }} />
				<Text style={{ ...mainStyles.subTitle, flex: 1 }}>Favorited</Text>
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
							<Icon name="heart" size={23} color={theme.primaryTouch} style={{ marginEnd: 10 }} />
							<Text style={{ ...mainStyles.subTitle, flex: 1 }}> Playlists</Text>
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
		// justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 20,
		marginBottom: 17,
		...mainStyles.stdVerticalMargin
	},
}

export default Playlists;