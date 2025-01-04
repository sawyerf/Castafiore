import React from 'react';
import { View, Text, ScrollView, Pressable, Image, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import { getCachedAndApi } from '~/utils/api';
import mainStyles from '~/styles/main';
import { urlCover } from '~/utils/api';
import Header from '~/components/Header';


const ShowAll = ({ navigation, route: { params: { type, query, title } } }) => {
  const insets = useSafeAreaInsets();
  const config = React.useContext(ConfigContext);
  const theme = React.useContext(ThemeContext);
  const [list, setList] = React.useState([]);

  React.useEffect(() => {
    getList();
  }, [type, query])

  const getPath = () => {
    if (type === 'album') return 'getAlbumList'
    if (type === 'artist') return 'getStarred'
    return type
  }

  const getList = async () => {
    const path = getPath()
    let nquery = query ? query : ''

    if (type == 'album') nquery += '&size=' + 100
    getCachedAndApi(config, path, nquery, (json) => {
      if (type == 'album') return setList(json?.albumList?.album)
      if (type == 'artist') return setList(json?.starred?.artist)
    })
  }

  const ItemComponent = React.memo(({item, index}) => (
    <Pressable
      style={styles.album}
      key={index}
      onLongPress={() => setIndexOptions(index)}
      delayLongPress={200}
      onPress={() => navigation.navigate('Album', { album: item })}>
      <Image
        style={styles.albumCover(type)}
        source={{
          uri: urlCover(config, item.id),
        }}
      />
      <Text numberOfLines={1} style={styles.titleAlbum(theme)}>{item.name}</Text>
      <Text numberOfLines={1} style={styles.artist(theme)}>{item.artist}</Text>
    </Pressable>
  ))

  return (
    <FlatList
      vertical={true}
      style={mainStyles.mainContainer(insets, theme)}
      contentContainerStyle={mainStyles.contentMainContainer(insets, true)}
      columnWrapperStyle={{
        gap: 10,
        paddingHorizontal: 20,
      }}
      numColumns={2}
      ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
      ListHeaderComponent={() => <Header title={title} />}
      data={list}
      keyExtractor={(item, index) => index}
      renderItem={({ item, index }) => (
        <ItemComponent item={item} index={index} />
      )}
    />
  );
}

const styles = {
  album: ({ pressed }) => ({
    flex: 1,
    maxWidth: "50%",
    opacity: pressed ? 0.5 : 1,
  }),
  albumCover: (type) => ({
    width: "100%",
    aspectRatio: 1,
    marginBottom: 6,
    borderRadius: type === 'artist' ? 500 : 0,
  }),
  titleAlbum: (theme) => ({
    color: theme.primaryLight,
    fontSize: 14,
    width: 160,
    marginBottom: 3,
    marginTop: 3,
  }),
  artist: theme => ({
    color: theme.secondaryLight,
    fontSize: 14,
    width: 160,
  }),
}

export default ShowAll;