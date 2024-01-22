import React from 'react'
import { Image } from 'react-native'

const ImageError = ({ source, style, children }) => {
	const [isImage, setIsImage] = React.useState(true)

	React.useEffect(() => {
		if (!source?.uri) setIsImage(false)
		else setIsImage(true)
	}, [source.uri])

	return (
		<>
			{isImage ? <Image
				source={source}
				onError={() => setIsImage(false)}
				style={style}
			/> : children}
		</>
	)
}

export default ImageError;