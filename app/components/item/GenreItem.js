import React from 'react'
import { Text, StyleSheet, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { useCachedFirst, urlCover } from '~/utils/api'
import { ConfigContext } from '~/contexts/config'
import ImageError from '~/components/ImageError'
import mainStyles from '~/styles/main'
import size from '~/styles/size'

const GenreItem = ({ genre, color }) => {
  const config = React.useContext(ConfigContext)
  const navigation = useNavigation()

  const [album] = useCachedFirst(null, 'getAlbumList2', { type: 'byGenre', genre: genre.value, size: 1 }, (json, setData) => {
    if (json?.albumList2?.album?.length) setData(json?.albumList2?.album[0])
    else setData(null)
  })

  return (
    <Pressable
      style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.genreBox, { backgroundColor: color }])}
      onPress={() => navigation.navigate('Genre', { name: genre.value, songCount: genre.songCount, albumCount: genre.albumCount })}
    >
      {
        album && (
          <>
            <ImageError source={{ uri: urlCover(config, album, 100) }} style={styles.albumCover} />
            <ImageError
              source={{ uri: urlCover(config, album.artistId, 100) }}
              style={[styles.artistCover, { borderColor: color }]}
            />
          </>
        )
      }
      <Text numberOfLines={1} style={styles.genreText}>{genre.value}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  genreBox: {
    flex: 1,
    height: size.image.large,
    width: size.image.large,
    borderRadius: 3,
    paddingHorizontal: 40,
    position: 'relative',
  },
  genreText: {
    color: 'white',
    fontSize: size.text.large,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  albumCover: {
    width: 100,
    aspectRatio: 1,
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 3,
  },
  artistCover: {
    width: 70,
    aspectRatio: 1,
    position: 'absolute',
    bottom: 32,
    right: 10,
    borderRadius: size.radius.circle,
    borderWidth: 4,
  },
})

export default GenreItem