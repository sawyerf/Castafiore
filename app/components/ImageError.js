import React from 'react'
import { Image } from 'react-native'

const ImageError = ({ source, style, children }) => {
	const [isImage, setIsImage] = React.useState(true)

	React.useEffect(() => {
		if (!source?.uri) setIsImage(false)
		else setIsImage(true)
	}, [source?.uri])

	if (isImage) {
		return (
			<Image
				source={source}
				onError={() => setIsImage(false)}
				style={style}
			/>
		)
	}
	return children
}

export default ImageError;