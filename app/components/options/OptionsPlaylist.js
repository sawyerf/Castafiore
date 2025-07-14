import React from 'react';
import { Platform, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { ConfigContext } from '~/contexts/config';
import { confirmAlert } from '~/utils/alert';
import { getApi } from '~/utils/api';
import OptionsPopup from '~/components/popup/OptionsPopup';

const OptionsPlaylist = ({ playlists, indexOption, setIndexOption, deletePlaylists, setDeletePlaylists, onRefresh }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const config = React.useContext(ConfigContext)
  const refOption = React.useRef()

  const isPin = (index) => {
    return playlists[index].comment?.includes(`#${config.username}-pin`)
  }

  const deletePlaylist = (id) => {
    getApi(config, 'deletePlaylist', `id=${id}`)
      .then(() => {
        refOption.current.close()
        setDeletePlaylists([...deletePlaylists, id])
      })
      .catch(() => { })
  }

  const pinToComment = (index) => {
    getApi(config, 'updatePlaylist', {
      playlistId: playlists[index].id,
      comment: `${playlists[index].comment || ''}#${config.username}-pin`,
    })
      .then(() => {
        onRefresh()
      })
      .catch(() => { })
  }

  const unPinToComment = (index) => {
    if (!playlists[index].comment) return
    if (!playlists[index].comment.includes(`#${config.username}-pin`)) return
    getApi(config, 'updatePlaylist', {
      playlistId: playlists[index].id,
      comment: playlists[index].comment.replaceAll(`#${config.username}-pin`, ''),
    })
      .then(() => {
        onRefresh()
      })
      .catch(() => { })
  }

  return (
    <OptionsPopup
      ref={refOption}
      visible={indexOption >= 0}
      close={() => setIndexOption(-1)}
      item={indexOption !== -1 ? playlists[indexOption] : null}
      options={[
        ...(() => {
          if (indexOption < 0) return []
          if (!isPin(indexOption)) return [{
            name: t('Pin playlist'),
            icon: 'bookmark',
            onPress: () => {
              refOption.current.close()
              pinToComment(indexOption)
            }
          }]
          return [{
            name: t('Unpin playlist'),
            icon: 'bookmark',
            onPress: () => {
              refOption.current.close()
              unPinToComment(indexOption)
            }
          }]
        })(),
        {
          name: t('Edit playlist'),
          icon: 'pencil',
          onPress: () => {
            navigation.navigate('EditPlaylist', { playlist: playlists[indexOption] })
            refOption.current.close()
          }
        },
        {
          name: (indexOption !== -1 && playlists[indexOption].public) ? t('Make private') : t('Make public'),
          icon: (indexOption !== -1 && playlists[indexOption].public) ? 'lock' : 'globe',
          onPress: () => {
            getApi(config, 'updatePlaylist', {
              playlistId: playlists[indexOption].id,
              public: !playlists[indexOption].public,
            })
              .then(() => {
                onRefresh()
                refOption.current.close()
              })
              .catch(() => { })
          }
        },
        {
          name: t('Delete playlist'),
          icon: 'trash',
          onPress: () => {
            confirmAlert(
              'Delete Playlist',
              `Are you sure you want to delete playlist: '${playlists[indexOption].name}' ?`,
              () => deletePlaylist(playlists[indexOption].id),
              () => refOption.current.close(),
            )
          }
        },
        {
          name: t('Share'),
          icon: 'share',
          onPress: () => {
            getApi(config, 'createShare', { id: playlists[indexOption].id })
              .then((json) => {
                if (json.shares.share.length > 0) {
                  if (Platform.OS === 'web') navigator.clipboard.writeText(json.shares.share[0].url)
                  else Share.share({ message: json.shares.share[0].url })
                }
              })
              .catch(() => { })
            refOption.current.close()
          }
        },
        {
          name: t('Info'),
          icon: 'info',
          onPress: () => {
            refOption.current.showInfo(playlists[indexOption])
            refOption.current.close()
          }
        },
      ]}
    />
  )
}

export default OptionsPlaylist;