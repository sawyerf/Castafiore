import React from 'react'
import { Text, FlatList, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'

import { useTheme } from '~/contexts/theme'
import { useConfig } from '~/contexts/config'
import { getApi } from '~/utils/api'
import { parseLrc } from '~/utils/lrc'
import Player from '~/utils/player'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Lyric = ({ song, style, color = null, sizeText = 23 }) => {
	const { t } = useTranslation()
	const [indexCurrent, setIndex] = React.useState(0)
	const [lyrics, setLyrics] = React.useState([])
	const [isLayout, setIsLayout] = React.useState(false)
	const config = useConfig()
	const refScroll = React.useRef(null)
	const theme = useTheme()
	const time = Player.updateTime()

	React.useEffect(() => {
		setLyrics([{ time: 0, text: t('Loading lyrics...') }])
		getLyrics()
	}, [song.songInfo])

	const getLyrics = () => {
		AsyncStorage.getItem(`lyrics/${song.songInfo.id}`)
			.then(res => {
				if (res) {
					const ly = JSON.parse(res)
					setIsLayout(true)
					setLyrics(ly)
				} else {
					getNavidromeLyrics()
				}
			})
	}

	React.useEffect(() => {
		if (lyrics.length == 0) return
		let index = lyrics.findIndex(ly => ly.time > time.position) - 1
		if (index === -1) index = 0
		if (index === -2) index = lyrics.length - 1
		if (index < 0) return
		if (index !== indexCurrent) {
			setIndex(index)
		}
	}, [time.position, lyrics])

	React.useEffect(() => {
		if (!isLayout) return
		refScroll.current.scrollToIndex({ index: indexCurrent, animated: true, viewOffset: 0, viewPosition: 0.5 })
	}, [indexCurrent, isLayout])

	const getNavidromeLyrics = () => {
		getApi(config, 'getLyricsBySongId', { id: song.songInfo.id })
			.then(res => {
				const ly = res.lyricsList?.structuredLyrics[0]?.line?.map(ly => ({ time: ly.start / 1000, text: ly.value.length ? ly.value : '...' }))
				if (ly.length == 0) { // If not found
					return getLrcLibLyrics()
				}
				ly.sort((a, b) => a.time - b.time)
				setLyrics(ly)
				AsyncStorage.setItem(`lyrics/${song.songInfo.id}`, JSON.stringify(ly))
			})
			.catch(() => { // If not found
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
				setLyrics([{ time: 0, text: t('No lyrics found') }])
			})
	}

	return (
		<FlatList
			ref={refScroll}
			style={[style, { borderRadius: null }]}
			contentContainerStyle={{ gap: 30 }}
			showsVerticalScrollIndicator={false}
			onScrollToIndexFailed={() => { }}
			initialNumToRender={lyrics.length}
			data={lyrics}
			onLayout={() => setIsLayout(true)}
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
								color: index === indexCurrent ? color?.active || theme.primaryText : color?.inactive || theme.secondaryText,
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