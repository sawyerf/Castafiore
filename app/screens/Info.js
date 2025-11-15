import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ConfigContext } from '~/contexts/config';
import { ThemeContext } from '~/contexts/theme';
import { urlCover } from '~/utils/url';
import { isSongCached, getSongCachedInfo, deleteSongCache } from '~/utils/cache';
import ButtonMenu from '~/components/settings/ButtonMenu';
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
	const [statsCache, setStatsCache] = React.useState([]);

	React.useEffect(() => {
		if (!info?.id) return
		isSongCached(config, info.id, global.streamFormat, global.maxBitRate)
			.then((isCached) => {
				if (!isCached) {
					setStatsCache([]);
					return;
				}
				getSongCachedInfo(config, info.id, global.streamFormat, global.maxBitRate)
					.then((res) => {
						if (res) setStatsCache(res);
						else setStatsCache([]);
					})
					.catch(() => setStatsCache([]));
			})
	}, [config, info.id]);

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
				}}
				source={{ uri: urlCover(config, info) }}
			/>
			<Text style={[mainStyles.largeText(theme.primaryText), {
				textAlign: 'center',
				marginTop: 15,
				paddingHorizontal: 30,
			}]}>{info.title || info.name}</Text>
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
				{
					statsCache.length ?
						<>
							<Text style={settingStyles.titleContainer(theme)}>{t("Cache")}</Text>
							<View style={settingStyles.optionsContainer(theme)}>
								{
									statsCache.map((item, index) => (
										<TableItem
											key={index}
											title={item.title}
											value={item.value}
										/>
									))
								}
								<ButtonMenu
									title={t("Delete from cache")}
									icon="trash"
									onPress={() => {
										deleteSongCache(config, info.id, global.streamFormat, global.maxBitRate);
										setStatsCache([]);
									}}
									isLast
								/>
							</View>
						</> : null
				}
			</View>
		</ScrollView>
	)
}

export default Info;