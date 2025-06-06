import React from 'react';
import { Text, View, FlatList, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import { useCachedAndApi } from '~/utils/api';
import BackButton from '~/components/button/BackButton';
import FavoritedButton from '~/components/button/FavoritedButton';
import ImageError from '~/components/ImageError';
import mainStyles from '~/styles/main';
import presStyles from '~/styles/pres';
import size from '~/styles/size';

const TYPES = ['newest', 'highest', 'frequent', 'recent', 'starred', 'random'];
const SIZES = [20, 50, 100, 200, 500];

const Selector = ({ current, items, setData }) => {
	const theme = React.useContext(ThemeContext)

	return (
		<ScrollView
			horizontal={true}
			showsHorizontalScrollIndicator={false}
			style={{ marginBottom: 30, flex: 1 }}
			contentContainerStyle={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20 }}
		>
			{items.map((item, index) => (
				<Pressable
					key={index}
					style={{
						paddingVertical: 7,
						paddingHorizontal: 15,
						borderRadius: 20,
						backgroundColor: current === item ? theme.primaryTouch : theme.secondaryBack,
					}}
					onPress={() => setData(item)}>
					<Text style={{ color: current === item ? theme.innerTouch : theme.primaryText }}>
						{typeof item === 'string' ? item.charAt(0).toUpperCase() + item.slice(1) : item}
					</Text>
				</Pressable>
			))}
		</ScrollView>
	)
}

const AlbumExplorer = () => {
	const insets = useSafeAreaInsets();
	const theme = React.useContext(ThemeContext)
	const navigation = useNavigation();
	const config = React.useContext(ConfigContext);
	const [type, setType] = React.useState('newest');
	const [parSize, setParSize] = React.useState(20);

	const [albums] = useCachedAndApi([], 'getAlbumList2', { type, size: parSize }, (json, setData) => {
		setData(json?.albumList2?.album || []);
	}, [type, parSize])

	return (
		<>
			<FlatList
				data={albums}
				keyExtractor={(item, index) => item.id || index.toString()}
				style={mainStyles.mainContainer(theme)}
				contentContainerStyle={[mainStyles.contentMainContainer(insets, false)]}
				ListHeaderComponent={
					<>
						<BackButton />
						<View style={styles.cover}>
							<Icon name="book" size={100} color={'#cd1921'} />
						</View>
						<View style={presStyles.headerContainer}>
							<View style={{ flex: 1 }}>
								<Text style={[presStyles.title(theme),]}>Albums</Text>
								<Text style={presStyles.subTitle(theme)}>Explore</Text>
							</View>
						</View>

						<Text style={{
							color: theme.primaryText,
							fontSize: size.text.medium,
							fontWeight: 'bold',
							marginHorizontal: 20,
							marginBottom: 10,
						}}>
							Type
						</Text>
						<Selector
							current={type}
							items={TYPES}
							setData={setType}
						/>
						<Text style={{
							color: theme.primaryText,
							fontSize: size.text.medium,
							fontWeight: 'bold',
							marginHorizontal: 20,
							marginBottom: 10,
						}}>
							Size
						</Text>
						<Selector
							current={parSize}
							items={SIZES}
							setData={setParSize}
						/>
					</>
				}
				renderItem={({ item }) => (
					<Pressable
						onPress={() => navigation.navigate('Album', item)}
						style={{
							marginHorizontal: 20,
							marginBottom: 10,
							flexDirection: 'row',
							gap: 15,
						}}>
						<ImageError
							source={{ uri: urlCover(config, item, 100) }}
							style={{
								width: 70,
								height: 70,
								backgroundColor: theme.secondaryBack,
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
								{item.name || item.album}
							</Text>
							<Text numberOfLines={1} style={{ color: theme.secondaryText, fontSize: size.text.small }}>
								{item.artist}
							</Text>
						</View>
						<FavoritedButton
							id={item.id}
							isFavorited={item.starred}
							style={{ padding: 5, paddingStart: 10 }}
							size={size.icon.medium}
						/>
					</Pressable>
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

export default AlbumExplorer;