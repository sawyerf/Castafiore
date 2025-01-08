import React from 'react';
import { Animated, ScrollView, Text, TextInput, View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext } from '~/contexts/config';
import { getCachedAndApi } from '~/utils/api';
import { SettingsContext } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import IconButton from '~/components/button/IconButton';
import mainStyles from '~/styles/main';
import SongsList from '~/components/lists/SongsList';
import VerticalPlaylist from '~/components/lists/VerticalPlaylist';
import size from '~/styles/size';


const Playlists = ({ navigation }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const [favorited, setFavorited] = React.useState([]);
	const [playlists, setPlaylists] = React.useState([]);
	const [newPlaylist, setNewPlaylist] = React.useState(null);
	const [isPublic, setIsPublic] = React.useState(false);
	const rotationValue = React.useRef(new Animated.Value(0)).current;
	const settings = React.useContext(SettingsContext)
	const rotation = rotationValue.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '360deg']
	})

	React.useEffect(() => {
		if (config.query) {
			getFavorited()
			getPlaylists()
		}
	}, [config])

	const onRefresh = () => {
		rotationValue.setValue(0)
		Animated.timing(rotationValue, {
			toValue: 1,
			duration: 1000,
			useNativeDriver: true,
		}).start()
		getFavorited()
		getPlaylists()
	}

	React.useEffect(() => {
		setPlaylists([...playlists].sort(sortPlaylist))
	}, [settings.pinPlaylist, settings.orderPlaylist])

	const isPin = (item) => {
		return item.comment?.includes(`#${config.username}-pin`) || settings.pinPlaylist.includes(item.id)
	}

	const sortPlaylist = (a, b) => {
		if (isPin(a) && !isPin(b)) {
			return -1
		} else if (!isPin(a) && isPin(b)) {
			return 1
		} else if (settings.pinPlaylist.includes(a.id) && settings.pinPlaylist.includes(b.id)) {
			return settings.pinPlaylist.indexOf(a.id) - settings.pinPlaylist.indexOf(b.id)
		} else if (settings.orderPlaylist === 'title') {
			return a.name.localeCompare(b.name)
		} else if (settings.orderPlaylist === 'changed') {
			return b.changed.localeCompare(a.changed)
		} else if (settings.orderPlaylist === 'newest') {
			return b.created.localeCompare(a.created)
		} else if (settings.orderPlaylist === 'oldest') {
			return a.created.localeCompare(b.created)
		}
	}

	const getFavorited = () => {
		getCachedAndApi(config, 'getStarred', null, (json) => {
			setFavorited(json.starred.song)
		})
	}

	const getPlaylists = () => {
		getCachedAndApi(config, 'getPlaylists', null, (json) => {
			setPlaylists([...json.playlists.playlist].sort(sortPlaylist))
		})
	}

	const addPlaylist = () => {
		if (!newPlaylist?.length) return
		getCachedAndApi(config, 'createPlaylist', `name=${newPlaylist}`, () => {
			setNewPlaylist(null)
			getPlaylists()
			setIsPublic(false)
		})
	}

	return (
		<ScrollView
			vertical={true}
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginEnd: 20, marginTop: 30, marginBottom: 20 }}>
				<Text style={[mainStyles.mainTitle(theme), { marginBottom: 0, marginTop: 0 }]}>Your Playlists</Text>
				<Animated.View style={{ transform: [{ rotate: rotation }] }}>
					<IconButton
						icon="refresh"
						size={size.icon.large}
						color={theme.primaryLight}
						style={{ paddingHorizontal: 10 }}
						onPress={onRefresh}
					/>
				</Animated.View>
			</View>
			<Pressable
				style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.subTitleParent, { marginTop: 0 }])}
				onPress={() => navigation.navigate('Favorited', { favorited })}
			>
				<Icon name="heart" size={size.icon.small} color={theme.primaryTouch} style={{ marginEnd: 10 }} />
				<Text style={[mainStyles.subTitle(theme), { flex: 1 }]}>Favorited</Text>
				<Text style={{ color: theme.secondaryLight, fontWeight: 'bold', fontSize: 15 }}>
					{favorited?.length} <Icon name="chevron-right" size={15} color={theme.secondaryLight} />
				</Text>
			</Pressable>
			<SongsList songs={favorited?.slice(0, settings.previewFavorited)} listToPlay={favorited} />

			<View style={[styles.subTitleParent, { marginTop: 10 }]}>
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
								style={{ padding: 10, paddingStart: 15, width: 10 + 15 + 20 }} />
							<IconButton
								icon={newPlaylist?.length > 0 ? 'plus' : 'times'}
								size={size.icon.tiny}
								color={theme.secondaryLight}
								style={{ padding: 10 }}
								onPress={() => newPlaylist?.length > 0 ? addPlaylist() : setNewPlaylist(null)} />
						</> :
						<>
							<Icon name="heart" size={size.icon.small} color={theme.primaryTouch} style={{ marginEnd: 10 }} />
							<Text style={[mainStyles.subTitle(theme), { flex: 1 }]}> Playlists</Text>
							<IconButton
								icon="plus"
								size={size.icon.tiny}
								color={theme.secondaryLight}
								style={{ padding: 10 }}
								onPress={() => newPlaylist?.length > 0 ? addPlaylist() : setNewPlaylist('')} />
						</>
				}
			</View>
			<VerticalPlaylist playlists={playlists} onRefresh={getPlaylists} />
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	subTitleParent: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 10,
		marginBottom: 17,
		...mainStyles.stdVerticalMargin
	},
})

export default Playlists;