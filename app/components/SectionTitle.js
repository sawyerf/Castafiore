import React from 'react'
import { Text, Pressable } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { ThemeContext } from '~/contexts/theme'
import mainStyles from '~/styles/main'
import size from '~/styles/size'

const SectionTitle = ({ title, onPress = null, button = false }) => {
  const theme = React.useContext(ThemeContext)

  return (
			<Pressable
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					width: '100%',
				}}
				disabled={!button}
				onPress={onPress}
			>
				<Text numberOfLines={1} style={[mainStyles.titleSection(theme), {
					flex: 1,
					marginEnd: 0,
				}]}>{title}</Text>
				{
					button ? <Icon
						name='angle-right'
						color={theme.secondaryText}
						size={size.icon.medium}
						style={mainStyles.titleSection(theme)}
					/> : null
				}
			</Pressable>
  )
}

export default SectionTitle