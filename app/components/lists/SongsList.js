import React from 'react';
import { Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ThemeContext } from '~/contexts/theme';
import SongItem from '~/components/item/SongItem';
import size from '~/styles/size';
import OptionsSongsList from '~/components/options/OptionsSongsList';

const SongsList = ({ songs, isIndex = false, listToPlay = null, isMargin = true, indexPlaying = null, idPlaylist = null, onUpdate = () => { }, onPress = () => true }) => {
	const theme = React.useContext(ThemeContext)
	const [indexOptions, setIndexOptions] = React.useState(-1)
	const isMultiCD = React.useMemo(() => songs?.some(item => item.discNumber !== songs[0].discNumber), [songs])

	return (
		<View style={{
			flexDirection: 'column',
			paddingHorizontal: isMargin ? 20 : 0,
		}}>
			{songs?.map((item, index) => {
				return (
					<View key={index}>
						{
							isIndex && isMultiCD && (index === 0 || songs[index - 1].discNumber !== item.discNumber) &&
							<View style={{ flexDirection: 'row', alignItems: 'center', marginStart: 5, marginBottom: 15, marginTop: 10, color: theme.primaryText }}>
								<Icon name="circle-o" size={size.icon.small} color={theme.secondaryText} />
								<Text style={{ color: theme.secondaryText, fontSize: size.text.large, marginBottom: 2, marginStart: 10 }}>Disc {item.discNumber}</Text>
							</View>
						}
						<SongItem
							song={item}
							queue={listToPlay ? listToPlay : songs}
							index={index}
							isIndex={isIndex}
							isPlaying={indexPlaying === index}
							setIndexOptions={setIndexOptions}
							onPress={onPress}
						/>
					</View>
				)
			})}
			<OptionsSongsList
				songs={songs}
				indexOptions={indexOptions}
				setIndexOptions={setIndexOptions}
				onUpdate={onUpdate}
				idPlaylist={idPlaylist}
			/>
		</View>
	)
}

export default SongsList;