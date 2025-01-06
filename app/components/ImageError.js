import React from 'react'
import { Image } from 'react-native'

const ImageError = ({ source, style = {}, children = null }) => {
	const [isImage, setIsImage] = React.useState(true)
	const lastSource = React.useRef(null)
	const ImageMemo = React.useMemo(() => {
		return <Image source={source} onError={() => setIsImage(false)} style={style} />
	}, [source?.uri])

	React.useEffect(() => {
		if (lastSource.current === source?.uri) return
		if (!source?.uri) setIsImage(false)
		else setIsImage(true)
		lastSource.current = source?.uri
	}, [source, source?.uri])

	if (isImage) return ImageMemo
	if (children) return children
	return (
		<Image
			source={require('~/../assets/foreground-icon.png')}
			style={style}
		/>
	)
}

export default ImageError;