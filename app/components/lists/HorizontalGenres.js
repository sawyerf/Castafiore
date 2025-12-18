import React from 'react'

import { useTheme } from '~/contexts/theme'
import CustomFlat from '~/components/lists/CustomFlat'
import GenreItem from '~/components/item/GenreItem'
import size from '~/styles/size'

const colorBakcground = [
	'#FF5733',
	'#3357FF',
	'#FF33A1',
	'#A133FF',
	'#FF8F33',
	'#338FFF',
	'#FF33D4',
	'#D433FF',
]

const HorizontalGenres = ({ genres }) => {
	const theme = useTheme()

	const renderItem = React.useCallback(({ item, index }) => (
		<GenreItem genre={item} color={colorBakcground[index % colorBakcground.length]} />
	), [theme])

	return (
		<CustomFlat
			data={genres}
			renderItem={renderItem}
			widthItem={size.image.large + 10}
		/>
	)
}

export default HorizontalGenres