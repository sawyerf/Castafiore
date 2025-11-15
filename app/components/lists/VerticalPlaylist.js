import React from 'react'
import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import PlaylistItem from '~/components/item/PlaylistItem'
import OptionsPlaylists from '~/components/options/OptionsPlaylists'

const VerticalPlaylist = ({ playlists, onRefresh }) => {
	const navigation = useNavigation()
	const [indexOption, setIndexOption] = React.useState(-1)
	const [deletePlaylists, setDeletePlaylists] = React.useState([])

	return (
		<View style={{
			paddingHorizontal: 20,
			width: '100%',
		}}>
			{
				playlists?.map((playlist, index) => {
					if (deletePlaylists.includes(playlist.id)) return null
					return (
						<PlaylistItem
							key={playlist.id}
							playlist={playlist}
							index={index}
							navigation={navigation}
							setIndexOption={setIndexOption}
						/>
					)
				})
			}

			<OptionsPlaylists
				playlists={playlists}
				indexOption={indexOption}
				setIndexOption={setIndexOption}
				deletePlaylists={deletePlaylists}
				setDeletePlaylists={setDeletePlaylists}
				onRefresh={onRefresh}
			/>
		</View>
	)
}

export default VerticalPlaylist