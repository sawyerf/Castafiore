import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/api';
import settingStyles from '~/styles/settings';
import TableItem from '~/components/settings/TableItem';
import mainStyles from '~/styles/main';
import Header from '~/components/Header';
import ImageError from '~/components/ImageError';
import size from '~/styles/size';

const Info = ({ route: { params: { info } } }) => {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const config = React.useContext(ConfigContext);
	const theme = React.useContext(ThemeContext)

	if (!info) return null;
	return (
		<ScrollView
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<Header title={t("Info")} />
			<ImageError
				style={{
					width: size.image.large,
					height: size.image.large,
					alignSelf: 'center',
					borderRadius: 5,
					marginTop: 20,
				}}
				source={{ uri: urlCover(config, info) }}
			/>
			<View style={[settingStyles.contentMainContainer, { marginTop: 30 }]}>
				<View style={settingStyles.optionsContainer(theme)}>
					{
						Object.keys(info).map((key, index) => (
							<TableItem
								key={index}
								title={key}
								value={info[key]}
								isLast={index === Object.keys(info).length - 1}
							/>
						))
					}
				</View>
			</View>
		</ScrollView>
	)
}

export default Info;