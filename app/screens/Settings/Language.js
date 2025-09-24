import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { SettingsContext, SetSettingsContext } from '~/contexts/settings';
import { ThemeContext } from '~/contexts/theme';
import Header from '~/components/Header';
import mainStyles from '~/styles/main';
import settingStyles from '~/styles/settings';
import SelectItem from '~/components/settings/SelectItem';

const languages = [
	{ lang: 'ca', name: 'Català', color: '#FCDD09', flag: '🇦🇩' },
	{ lang: 'de', name: 'Deutsch', color: '#dddddd', flag: '🇩🇪' },
	{ lang: 'en', name: 'English', color: '#dc3545', flag: '🇬🇧' },
	{ lang: 'es', name: 'Español', color: '#af0d12', flag: '🇪🇸' },
	{ lang: 'gl', name: 'Galego', color: '#2195ddff', flag: '🇪🇸' },
	{ lang: 'fr', name: 'Français', color: '#007bff', flag: '🇫🇷' },
	{ lang: 'it', name: 'Italiano', color: '#28a745', flag: '🇮🇹' },
	{ lang: 'ru', name: 'Русский', color: '#ffc107', flag: '🇷🇺' },
	{ lang: 'zhHans', name: '简体中文', color: '#FF0000', flag: '🇨🇳' },
	{ lang: 'zhHant', name: '正體中文', color: '#0000AA', flag: '🇹🇼' },
]

const Language = () => {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const settings = React.useContext(SettingsContext)
	const setSettings = React.useContext(SetSettingsContext)
	const theme = React.useContext(ThemeContext)

	return (
		<ScrollView
			style={mainStyles.mainContainer(theme)}
			contentContainerStyle={mainStyles.contentMainContainer(insets)}
		>
			<Header title={t("Language")} />
			<View style={settingStyles.contentMainContainer}>
				<Text style={settingStyles.titleContainer(theme)}>{t('Language')}</Text>
				<View style={settingStyles.optionsContainer(theme)}>
					{
						languages.map((lang, index) => (
							<SelectItem
								key={index}
								text={lang.name}
								emoji={lang.flag}
								colorIcon={lang.color}
								isSelect={lang.lang == settings.language}
								onPress={() => {
									setSettings({ ...settings, language: lang.lang })
								}}
							/>
						))
					}
				</View>
			</View>
		</ScrollView>
	)
}


export default Language;
