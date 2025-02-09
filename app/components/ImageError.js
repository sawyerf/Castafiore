import React from 'react'
import { View, Image } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'

import size from '~/styles/size'
import { ThemeContext } from '~/contexts/theme'

const ImageError = ({ source, style = {}, children = null, iconError = null }) => {
	const [isImage, setIsImage] = React.useState(true)
	const lastSource = React.useRef(null)
	const theme = React.useContext(ThemeContext)
	const ImageMemo = React.useMemo(() => {
		return <Image source={source} onError={() => setIsImage(false)} style={style} />
	}, [source?.uri, style])

	React.useEffect(() => {
		if (lastSource.current === source?.uri) return
		if (!source?.uri) setIsImage(false)
		else setIsImage(true)
		lastSource.current = source?.uri
	}, [source, source?.uri])

	if (isImage) return ImageMemo
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