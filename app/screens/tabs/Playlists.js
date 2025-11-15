import React from 'react';
import { Animated, ScrollView, Text, TextInput, View, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext } from '~/contexts/config';
import { useCachedAndApi, getApi } from '~/utils/api';
import { SettingsContext } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import IconButton from '~/components/button/IconButton';
import mainStyles from '~/styles/main';
import SongsList from '~/components/lists/SongsList';
import VerticalPlaylist from '~/components/lists/VerticalPlaylist';
import size from '~/styles/size';

const Playlists = ({ navigation }) => {
	const { t } = useTranslation();
	const config = React.useContext(ConfigContext)
	const insets = useSafeAreaInsets();
	const settings = React.useContext(SettingsContext)
	const theme = React.useContext(ThemeContext)
	const [newPlaylist, setNewPlaylist] = React.useState(null);
	const rotationValue = React.useRef(new Animated.Value(0)).current;
	const rotation = rotationValue.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '360deg']
	})

	const [favorited, refreshFavorited] = useCachedAndApi([], 'getStarred2', null, (json, setData) => {
		setData(json?.starred2?.song)
	}, [])

	const [playlists, refreshPlaylists, setPlaylists] = useCachedAndApi([], 'getPlaylists', null, (json, setData) => {
		setData([...(json?.playlists?.playlist || [])].sort(sortPlaylist))
	}, [])

	React.useEffect(() => {
		setPlaylists([...playlists].sort(sortPlaylist))
	}, [settings.orderPlaylist])

	const onRefresh = () => {
		rotationValue.setValue(0)
		Animated.timing(rotationValue, {
			toValue: 1,
			duration: 1000,
			useNativeDriver: Platform.OS !== 'web',
		}).start()
		refreshFavorited()
		refreshPlaylists()
	}

	const isPin = (item) => {
		return item.comment?.includes(`#${config.username}-pin`)
	}

	const sortPlaylist = (a, b) => {
		if (isPin(a) && !isPin(b)) {
			return -1
		} else if (!isPin(a) && isPin(b)) {
			return 1
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

	const addPlaylist = () => {
		if (!newPlaylist?.length) return
		getApi(config, 'createPlaylist', `name=${newPlaylist}`)
			.then(() => {
				setNewPlaylist(null)
				refreshPlaylists()
			})
	}

	return (
		<ScrollView
			vertical={true}
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginEnd: 20, marginTop: 30, marginBottom: 20 }}>
				<Text style={[mainStyles.mainTitle(theme), { marginBottom: 0, marginTop: 0 }]}>{t('Your Playlists')}</Text>
				<Animated.View style={{ transform: [{ rotate: rotation }] }}>
					<IconButton
						icon="refresh"
						size={size.icon.large}
						color={theme.primaryText}
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
				<Text style={[mainStyles.subTitle(theme), { flex: 1 }]}>{t('Favorited')}</Text>
				<Text style={{ color: theme.secondaryText, fontWeight: 'bold', fontSize: 15 }}>
					{favorited?.length} <Icon name="chevron-right" size={15} color={theme.secondaryText} />
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
									color: theme.primaryText,
									flex: 1,
									paddingHorizontal: 10,
									outline: 'none',
								}}
								onSubmitEditing={() => addPlaylist()}
								autoFocus={true}
								onChangeText={text => setNewPlaylist(text)}
								value={newPlaylist}
							/>
							<IconButton
								icon={newPlaylist?.length > 0 ? 'plus' : 'times'}
								size={size.icon.tiny}
								color={theme.secondaryText}
								style={{ padding: 10, paddingStart: 20 }}
								onPress={() => newPlaylist?.length > 0 ? addPlaylist() : setNewPlaylist(null)} />
						</> :
						<>
							<Icon name="heart" size={size.icon.small} color={theme.primaryTouch} style={{ marginEnd: 10 }} />
							<Text style={[mainStyles.subTitle(theme), { flex: 1 }]}>{t('Playlists')}</Text>
							<IconButton
								icon="plus"
								size={size.icon.tiny}
								color={theme.secondaryText}
								style={{ padding: 10 }}
								onPress={() => newPlaylist?.length > 0 ? addPlaylist() : setNewPlaylist('')} />
						</>
				}
			</View>
			<VerticalPlaylist playlists={playlists} onRefresh={refreshPlaylists} />
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