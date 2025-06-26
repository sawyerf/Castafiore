import React from 'react';
import { Text, View, TextInput, Pressable } from 'react-native';
import { LegendList } from "@legendapp/list"
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/contexts/config';
import { getApi, urlCover, useCachedAndApi } from '~/utils/api';
import { SettingsContext } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import BackButton from '~/components/button/BackButton';
import ImageError from '~/components/ImageError';
import mainStyles from '~/styles/main';
import OptionsSongsList from '~/components/options/OptionsSongsList';
import presStyles from '~/styles/pres';
import RandomButton from '~/components/button/RandomButton';
import SongItem from '~/components/item/SongItem';

const Playlist = ({ route: { params } }) => {
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext)
	const theme = React.useContext(ThemeContext)
	const settings = React.useContext(SettingsContext)
	const [info, setInfo] = React.useState(null)
	const [title, setTitle] = React.useState(null)
	const [indexOptions, setIndexOptions] = React.useState(-1)

	const [songs, refresh] = useCachedAndApi([], 'getPlaylist', `id=${params.playlist.id}`, (json, setData) => {
		setInfo(json?.playlist)
		if (settings.reversePlaylist) setData(json?.playlist?.entry?.map((item, index) => ({ ...item, index })).reverse() || [])
		else setData(json?.playlist?.entry?.map((item, index) => ({ ...item, index })) || [])
	}, [params.playlist.id, settings.reversePlaylist])

	const renderItem = React.useCallback(({ item, index }) => (
		<SongItem
			song={item}
			queue={songs}
			index={index}
			setIndexOptions={setIndexOptions}
			style={{
				paddingHorizontal: 20,
			}}
		/>
	), [songs]);

	return (
		<>
			<LegendList
				data={songs}
				keyExtractor={(item, index) => index}
				style={mainStyles.mainContainer(theme)}
				contentContainerStyle={[mainStyles.contentMainContainer(insets, false)]}
				recycleItems={true}
				waitForInitialLayout={false}
				estimatedItemSize={60}
				ListHeaderComponent={
					<>
						<BackButton />
						<ImageError
							style={[presStyles.cover, { backgroundColor: theme.secondaryBack }]}
							source={{ uri: urlCover(config, params.playlist) }}
						/>
						<View style={presStyles.headerContainer}>
							<View style={{ flex: 1 }}>
								{
									title != null ? (
										<TextInput
											style={[presStyles.title(theme), { outline: 'none' }]}
											value={title}
											onChangeText={text => setTitle(text)}
											autoFocus={true}
											onSubmitEditing={() => {
												getApi(config, 'updatePlaylist', { playlistId: params.playlist.id, name: title })
													.then(() => {
														setTitle(null);
														refresh();
													})
													.catch(() => { });
											}}
											onBlur={() => setTitle(null)}
										/>
									) : (
										<Pressable
											style={mainStyles.opacity}
											onLongPress={() => setTitle(info.name)}
											delayLongPress={200}
										>
											<Text style={presStyles.title(theme)} numberOfLines={2}>
												{info?.name || params.playlist?.name}
											</Text>
										</Pressable>
									)
								}
								<Text style={presStyles.subTitle(theme)}>
									{((info?.duration || params?.playlist?.duration) / 60) | 1} minutes · {info?.songCount || params?.playlist?.songCount} songs
								</Text>
							</View>
							<RandomButton songList={songs} style={presStyles.button} />
						</View>
					</>
				}
				renderItem={renderItem}
			/>
			<OptionsSongsList
				songs={songs}
				onUpdate={refresh}
				indexOptions={indexOptions}
				setIndexOptions={setIndexOptions}
				idPlaylist={params.playlist.id}
			/>
		</>
	);
}

export default Playlist;