import React from 'react';
import { Text, View, Button, TextInput, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import theme from '../utils/theme';
import { getConfig } from '../utils/config';
import SongsList from '../components/SongsList';
import mainStyles from '../styles/main';
import presStyles from '../styles/pres';

const Favorited = ({ navigation, route }) => {
	const insets = useSafeAreaInsets();
	const [config, setConfig] = React.useState({});

	React.useEffect(() => {
		getConfig()
			.then((config) => {
				setConfig(config)
			})
	}, [])

	return (
		<ScrollView
			vertical={true}
			style={{
				...mainStyles.mainContainer(insets),
				paddingTop: 0,
			}}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}>
			<View
				style={styles.cover}
			>
				<Icon name="heart" size={100} color={theme.primaryTouch} />
			</View>
			<Text style={presStyles.title}><Icon name="heart" size={23} color={theme.primaryTouch} /> Favorited</Text>
			<Text style={presStyles.subTitle}>{route.params.favorited.length} songs</Text>
			<SongsList songs={route.params.favorited} config={config} />
		</ScrollView>
	)
}

const styles = {
	cover: {
		width: "100%",
		height: 300,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#c68588',
	},
}

export default Favorited;