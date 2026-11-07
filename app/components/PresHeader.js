import React from 'react'
import { Text, View, Pressable, useWindowDimensions } from 'react-native'
import { useTranslation } from 'react-i18next'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useConfig } from '~/contexts/config'
import { useSongDispatch } from '~/contexts/song'
import { useTheme } from '~/contexts/theme'
import { playSong } from '~/utils/player'
import BackButton from '~/components/button/BackButton'
import mainStyles from '~/styles/main'
import presStyles from '~/styles/pres'
import ImageError from '~/components/ImageError'
import Icon from '~/components/Icon'
import IconButton from '~/components/button/IconButton'
import size from '~/styles/size'

// Soft fade from the tertiary background into the page background.
export const HeaderGradient = ({ theme, height }) => (
	<Svg width="100%" height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
		<Defs>
			<LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
				<Stop offset="0" stopColor={theme.tertiaryBack} />
				<Stop offset="1" stopColor={theme.primaryBack} />
			</LinearGradient>
		</Defs>
		<Rect width="100%" height={height} fill="url(#fade)" />
	</Svg>
)

export const PlayCircle = ({ songs }) => {
	const { t } = useTranslation()
	const theme = useTheme()
	const config = useConfig()
	const songDispatch = useSongDispatch()

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={t('Play')}
			disabled={!songs?.length}
			onPress={() => playSong(config, songDispatch, songs, 0)}
			style={({ pressed }) => ([mainStyles.opacity({ pressed }), {
				width: 56,
				height: 56,
				borderRadius: size.radius.circle,
				backgroundColor: theme.primaryTouch,
				alignItems: 'center',
				justifyContent: 'center',
				marginEnd: 20,
				opacity: songs?.length ? 1 : 0.4,
			}])}
		>
			<Icon name="play" size={size.icon.medium} color={theme.innerTouch} style={{ marginStart: 3 }} />
		</Pressable>
	)
}

const PresHeader = ({ title, subTitle, imgSrc, songs = null, onPressTitle = null, onPressOption = null, children = null }) => {
	const theme = useTheme()
	const insets = useSafeAreaInsets()
	const { width } = useWindowDimensions()
	const cover = Math.min(width * 0.6, 260)

	return (
		<>
			<BackButton />
			{
				onPressOption ?
					<IconButton
						icon="ellipsis-h"
						onPress={onPressOption}
						color={theme.primaryText}
						style={{
							position: 'absolute',
							padding: 20,
							top: insets.top,
							right: insets.left,
							zIndex: 2
						}}
					/> : null
			}
			<View style={{ alignItems: 'center', paddingTop: insets.top + 60, paddingBottom: 20 }}>
				<HeaderGradient theme={theme} height={cover + insets.top + 80} />
				<ImageError
					style={{
						width: cover,
						height: cover,
						borderRadius: size.radius.sm,
						backgroundColor: theme.secondaryBack,
						boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
						elevation: 12,
					}}
					source={{ uri: imgSrc }}
				/>
			</View>
			<Text style={presStyles.title(theme)} numberOfLines={2}>{title}</Text>
			<Pressable
				style={mainStyles.opacity}
				onPress={onPressTitle}
				disabled={!onPressTitle}
			>
				<Text style={presStyles.subTitle(theme)}>{subTitle}</Text>
			</Pressable>
			<View style={presStyles.headerContainer}>
				<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>{children}</View>
				{songs ? <PlayCircle songs={songs} /> : null}
			</View>
		</>
	)
}

export default PresHeader
