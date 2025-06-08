import React from 'react';
import { Pressable, Text, StyleSheet, Platform } from 'react-native';

import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import ImageError from '~/components/ImageError';
import mainStyles from '~/styles/main';
import size from '~/styles/size';

const AllItem = ({ item, type, onPress, }) => {
  const config = React.useContext(ConfigContext);
  const theme = React.useContext(ThemeContext);

  return (
    <Pressable
      style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.item])}
      onPress={() => onPress(item)}>
      <ImageError
        style={styles.cover(type)}
        source={{
          uri: urlCover(config, item),
        }}
        iconError={['artist', 'artist_all'].includes(type) ? 'user' : 'music'}
      />
      <Text numberOfLines={1} style={styles.title(theme, type)}>{item.name || item.album || item.title}</Text>
      <Text numberOfLines={1} style={styles.subTitle(theme)}>{item.artist}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  item: Platform.select({
    native: {
      flex: 1,
      maxWidth: "50%",
    },
    web: {
      minWidth: size.image.large,
      maxWidth: 245,
    }
  }),
  cover: (type) => ({
    width: "100%",
    aspectRatio: 1,
    marginBottom: 6,
    borderRadius: ['artist', 'artist_all'].includes(type) ? size.radius.circle : 0,
  }),
  title: (theme, type) => ({
    textAlign: ['artist', 'artist_all'].includes(type) ? 'center' : 'left',
    color: theme.primaryText,
    fontSize: size.text.small,
    width: '100%',
    marginBottom: 3,
    marginTop: 3,
  }),
  subTitle: theme => ({
    color: theme.secondaryText,
    fontSize: size.text.small,
    width: '100%',
  }),
})

export default AllItem;