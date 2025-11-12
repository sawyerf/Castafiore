import React from 'react'
import { Text, View, StyleSheet, Pressable, Platform } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { ConfigContext } from '~/contexts/config'
import { urlCover } from '~/utils/api'
import { ThemeContext } from '~/contexts/theme'
import { SettingsContext } from '~/contexts/settings'
import ImageError from '~/components/ImageError'
import mainStyles from '~/styles/main'
import size from '~/styles/size'

const PlaylistItem = ({ playlist, index, setIndexOption}) => {
  const { t } = useTranslation()
  const config = React.useContext(ConfigContext)
  const theme = React.useContext(ThemeContext)
  const [isHover, setIsHover] = React.useState(false)
  const settings = React.useContext(SettingsContext)
  const navigation = useNavigation()

  return (
    <Pressable
      style={({ pressed }) => ([mainStyles.opacity({ pressed }), styles.favoritedSong, { backgroundColor: isHover ? theme.secondaryBack : 'transparent' }])}
      key={playlist.id}
      onHoverIn={() => { settings.isDesktop && setIsHover(true) }}
      onHoverOut={() => { settings.isDesktop && setIsHover(false) }}
      onPress={() => navigation.navigate('Playlist', { playlist: playlist })}
      delayLongPress={200}
      onLongPress={() => setIndexOption(index)}
      onContextMenu={(ev) => {
        ev.preventDefault()
        setIndexOption(index)
      }}
    >
      <ImageError
        style={mainStyles.coverSmall(theme)}
        source={{ uri: urlCover(config, playlist, 100) }}
      />
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Text numberOfLines={1} style={[mainStyles.mediumText(theme.primaryText), { flex: Platform.select({ web: undefined, default: 0 }) }]}>
            {playlist.name}
          </Text>
          {!playlist.public && <Icon name='lock' size={10} color={theme.secondaryText} style={{ marginTop: 3 }} />}
        </View>
        <Text numberOfLines={1} style={mainStyles.smallText(theme.secondaryText)}>
          {(playlist.duration / 60) | 1} {t('min')} · {playlist.songCount} {t('songs')}
        </Text>
      </View>
      {playlist.comment?.includes(`#${config.username}-pin`) && <Icon name="bookmark" size={size.icon.small} color={theme.secondaryText} style={{ paddingEnd: 5 }} />}
    </Pressable>
  )
}

const styles = StyleSheet.create({
	favoritedSong: {
		gap: 10,
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
    borderRadius: 4,
	},
})

export default PlaylistItem