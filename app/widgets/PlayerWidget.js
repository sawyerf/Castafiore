import { FlexWidget, IconWidget, ImageWidget, OverlapWidget } from 'react-native-android-widget'

const playIcon = '\uF04B'
const pauseIcon = '\uF04C'
const nextIcon = '\uF051'
const prevIcon = '\uF048'

const PlayerWidget = ({ height, width, coverUrl, isPlaying }) => {
	return (
		<OverlapWidget>
			<FlexWidget
				style={{
					width: width > height ? width : height,
					height: width > height ? width : height,
					marginTop: width > height ? (height - width) / 2 : 0,
					marginLeft: width > height ? 0 : (width - height) / 2,
					overflow: 'hidden',
				}}
			>
				<ImageWidget
					image={coverUrl}
					style={{
						resizeMode: 'cover',
					}}
					imageWidth={width > height ? width : height}
					imageHeight={width > height ? width : height}
				/>
			</FlexWidget>
			<FlexWidget
				style={{
					width: width,
					height: height,
					flexDirection: 'row',
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: 'rgba(0,0,0,0.4)',
				}}
			>
				<IconWidget
					font="FontAwesome"
					icon={prevIcon}
					size={30}
					clickAction={'PREV_ACTION'}
					style={{
						color: "white",
						padding: 8,
					}}
				/>
				<IconWidget
					font="FontAwesome"
					icon={isPlaying ? pauseIcon : playIcon}
					size={45}
					clickAction={isPlaying ? 'PAUSE_ACTION' : 'PLAY_ACTION' }
					style={{
						color: "white",
						padding: 8,
						marginHorizontal: 20,
					}}
				/>
				<IconWidget
					font="FontAwesome"
					icon={nextIcon}
					size={30}
					clickAction={'NEXT_ACTION'}
					style={{
						color: "white",
						padding: 8,
					}}
				/>
			</FlexWidget>
		</OverlapWidget >
	)
}

export default PlayerWidget