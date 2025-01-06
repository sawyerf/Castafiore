import React from 'react'

const ListMap = ({ data, renderItem, ListEmptyComponent = null }) => {
	if (!data || data.length === 0) return ListEmptyComponent
	return (
		<>
			{data.map(renderItem)}
		</>
	)
}

export default ListMap
