import React from 'react'
import { View, Image } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'

import size from '~/styles/size'
import { ThemeContext } from '~/contexts/theme'

const ImageMemo = React.memo(Image, (prevProps, nextProps) => {
	return prevProps.source?.uri === nextProps.source?.uri
})

const ImageError = ({ source, style = {}, children = null, iconError = null }) => {
	const [isImage, setIsImage] = React.useState(false)
	const [lastSource, setLastSource] = React.useState({ uri: null })
	const theme = React.useContext(ThemeContext)

	React.useEffect(() => {
		if (lastSource.uri === source?.uri) return
		if (!source?.uri) {
			setIsImage(false)
			setLastSource(source)
		} else {
			setLastSource(source)
			setIsImage(true)
		}
	}, [source, source?.uri])

	if (isImage) return <ImageMemo source={lastSource} onError={() => setIsImage(false)} style={style} />
	if (children) return children
	if (iconError) return (
		<View style={[{ justifyContent: 'center', alignItems: 'center' }, style]}>
			<Icon name={iconError} size={size.icon.large} color={theme.primaryText} />
		</View>
	)
	return (
		<Image
			source={require('~/../assets/foreground-icon.png')}
			style={style}
		/>
	)
}

export default ImageError;