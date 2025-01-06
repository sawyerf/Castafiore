import React from 'react'
import { Text, FlatList, Pressable } from 'react-native'

import { ThemeContext } from '~/contexts/theme'
import { ConfigContext } from '~/contexts/config'
import { getApi } from '~/utils/api'
import { parseLrc } from '~/utils/lrc'
import Player from '~/utils/player'
import AsyncStorage from '@react-native-async-storage/async-storage'


const Lyric = ({ song, time, style, color = null, sizeText = 23 }) => {
	const [indexCurrent, setIndex] = React.useState(0)
	const [lyrics, setLyrics] = React.useState([])
	const config = React.useContext(ConfigContext)
	const refScroll = React.useRef(null)
	const theme = React.useContext(ThemeContext)

	React.useEffect(() => {
		getLyrics()
	}, [song.songInfo])

	const getLyrics = () => {
		AsyncStorage.getItem(`lyrics/${song.songInfo.id}`)
			.then(res => {
				if (res) {
					const ly = JSON.parse(res)
					setLyrics(ly)
				} else {
					getNavidromeLyrics()
				}
			})
	}

	React.useEffect(() => {
		if (lyrics.length == 0) return
		const index = lyrics.findIndex(ly => ly.time > time.position) - 1
		if (index < 0) return
		if (index !== indexCurrent) {
			refScroll.current.scrollToIndex({ index, animated: true, viewOffset: 0, viewPosition: 0.5 })
			setIndex(index)
		}
	}, [time.position])

	const getNavidromeLyrics = () => {
		getApi(config, 'getLyricsBySongId', { id: song.songInfo.id })
			.then(res => {
				const ly = res.lyricsList?.structuredLyrics[0]?.line?.map(ly => ({ time: ly.start / 1000, text: ly.value.length ? ly.value : '...' }))
				if (ly.length == 0) { // not found
					return getLrcLibLyrics()
				}
				ly.sort((a, b) => a.time - b.time)
				setLyrics(ly)
				AsyncStorage.setItem(`lyrics/${song.songInfo.id}`, JSON.stringify(ly))
			})
			.catch(() => { // not found
				getLrcLibLyrics()
			})
	}

	const getLrcLibLyrics = () => {
		const params = {
			track_name: song.songInfo.title,
			artist_name: song.songInfo.artist,
			album_name: song.songInfo.album,
			duration: song.songInfo.duration
		}
		fetch('https://lrclib.net/api/get?' + Object.keys(params).map((key) => `${key}=${encodeURIComponent(params[key])}`).join('&'), {
			headers: { 'Lrclib-Client': 'Castafiore' }
		})
			.then(res => res.json())
			.then(res => {
				const ly = parseLrc(res.syncedLyrics)
				setLyrics(ly)
				AsyncStorage.setItem(`lyrics/${song.songInfo.id}`, JSON.stringify(ly))
			})
			.catch(() => {
				setLyrics([{ time: 0, text: 'No lyrics found' }])
			})
	}

	return (
		<FlatList
			style={[style, { borderRadius: null }]}
			showsVerticalScrollIndicator={false}
			data={lyrics}
			ref={refScroll}
			initialNumToRender={lyrics.length}
			keyExtractor={(item, index) => index}
			renderItem={({ item, index }) => {
				return (
					<Pressable
						onPress={() => {
							Player.setPosition(item.time)
						}}
					>
						<Text
							style={{
								color: index === indexCurrent ? color?.active || theme.primaryLight : color?.inactive || theme.secondaryLight,
								fontSize: sizeText,
								textAlign: 'center',
							}}>
							{item.text.length ? item.text : '...'}
						</Text>
					</Pressable>
				)
			}}
		/>
	)
}

export default Lyric