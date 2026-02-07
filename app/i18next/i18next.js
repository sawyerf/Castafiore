import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './en.json'
import it from './it.json'
import fr from './fr.json'
import ru from './ru.json'
import de from './de.json'
import es from './es.json'
import ca from './ca.json'
import gl from './gl.json'
import zhHans from './zh-Hans.json'
import zhHant from './zh-Hant.json'
import ptBr from './pt-br.json'
import ja from './ja.json'
import ko from './ko.json'

i18n.use(initReactI18next).init({
	lng: 'en',
	fallbackLng: 'en',
	resources: {
		en: en,
		ca: ca,
		de: de,
		es: es,
		fr: fr,
		gl: gl,
		it: it,
		ja: ja,
		ko: ko,
		ptBr: ptBr,
		pt: ptBr,
		ru: ru,
		zh: zhHans,
		zhHans: zhHans,
		zhHant: zhHant,
	},
	interpolation: {
		escapeValue: false
	}
})

export default i18n