import React from 'react'
import { Image } from 'react-native'

const ImageError = ({ source, style = {}, children = null }) => {
	const [isImage, setIsImage] = React.useState(true)
	const image = React.useMemo(() => {
		return <Image source={source} onError={() => setIsImage(false)} style={style} />
	}, [source?.uri, style])

	React.useEffect(() => {
		if (!source?.uri) setIsImage(false)
		else setIsImage(true)
	}, [source, source?.uri])

	if (isImage) return image
	if (children) return children
	return (
		<Image
			source={require('~/../assets/foreground-icon.png')}
			style={style}
		/>
	)
}

export default ImageError;