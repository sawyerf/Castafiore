import React from 'react';
import { Text, View, SectionList, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext } from '~/contexts/config';
import { useCachedAndApi } from '~/utils/api';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import BackButton from '~/components/button/BackButton';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import ImageError from '~/components/ImageError';
import size from '~/styles/size';
import FavoritedButton from '~/components/button/FavoritedButton';

const ArtistExplorer = () => {
	const insets = useSafeAreaInsets();
	const theme = React.useContext(ThemeContext)
	const navigation = useNavigation();
	const config = React.useContext(ConfigContext);

	const [artists] = useCachedAndApi([], 'getArtists', null, (json, setData) => {
		setData(json?.artists?.index.map(item => ({
			title: item.name,
			data: item.artist
		})) || []);
	})

	const [favorited] = useCachedAndApi([], 'getStarred', null, (json, setData) => {
		setData(json?.starred?.artist || []);
	}, []);


	const isFavorited = React.useCallback((id) => {
		return favorited.some(fav => fav.id === id);
	}, [favorited]);

	return (
		<>
			<SectionList
				sections={artists}
				keyExtractor={(item, index) => item.id || index.toString()}
				style={mainStyles.mainContainer(theme)}
				contentContainerStyle={[mainStyles.contentMainContainer(insets, false)]}
				maxToRenderPerBatch={20}
				ListHeaderComponent={
					<>
						<BackButton />
						<View style={styles.cover}>
							<Icon name="group" size={100} color={'#cd1921'} />
						</View>
						<View style={presStyles.headerContainer}>
							<View style={{ flex: 1 }}>
								<Text style={presStyles.title(theme)}>Artists</Text>
								<Text style={presStyles.subTitle(theme)}>Explore</Text>
							</View>
						</View>
					</>
				}
				renderItem={({ item }) => (
					<Pressable
						onPress={() => {
							navigation.navigate('Artist', { id: item.id, name: item.name });
						}}
						style={{
							marginHorizontal: 20,
							marginBottom: 10,
							flexDirection: 'row',
							gap: 10,
						}}>
						<ImageError
							source={{ uri: urlCover(config, item.id, 100) }}
							iconError="user"
							style={{
								width: 70,
								height: 70,
								backgroundColor: theme.secondaryBack,
								borderRadius: size.radius.circle,
							}}
						/>
						<View style={{
							flex: 1,
							flexDirection: 'column',
							justifyContent: 'center',
						}}>
							<Text
								style={{
									color: theme.primaryText,
									fontSize: size.text.medium,
									overflow: 'hidden',
									marginBottom: 2,
								}}
								numberOfLines={1}
							>
								{item.name}
							</Text>
							<Text numberOfLines={1} style={{ color: theme.secondaryText, fontSize: size.text.small }}>
								{item.albumCount} albums
							</Text>
						</View>
						<FavoritedButton
							id={item.id}
							isFavorited={isFavorited(item.id)}
							style={{ padding: 5, paddingStart: 10 }}
							size={size.icon.medium}
						/>
					</Pressable>
				)}
				renderSectionHeader={({ section }) => (
					<Text style={[mainStyles.titleSection(theme), {
						marginTop: 10,
						marginBottom: 10,
						marginHorizontal: 20,
					}]}>{section.title}</Text>
				)}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	cover: {
		width: "100%",
		height: 300,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#c68588',
	},
})

export default ArtistExplorer;