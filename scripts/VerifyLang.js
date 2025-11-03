// script that check if language keys are translated in all files
const fs = require('fs')
const path = require('path')
const languagesDir = path.join(__dirname, '..', 'app', 'i18next')
const baseLanguageFile = path.join(languagesDir, 'en.json')

const baseLanguage = JSON.parse(fs.readFileSync(baseLanguageFile, 'utf8'))

const checkTranslations = (baseObj, compareObj, parentKey = '') => {
  for (const key in baseObj) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key
    if (typeof baseObj[key] === 'object' && baseObj[key] !== null) {
      if (!(key in compareObj)) {
        console.log(`Missing key: ${fullKey}`)
      } else {
        checkTranslations(baseObj[key], compareObj[key], fullKey)
      }
    } else {
      if (!(key in compareObj)) {
        console.log(`Missing key: ${fullKey}`)
      }
    }
  }
}

fs.readdirSync(languagesDir).forEach(file => {
  if (file.endsWith('.json') && file !== 'en.json') {
    const filePath = path.join(languagesDir, file)
    const compareLanguage = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    console.log(`\nChecking translations for ${file}:`)
    checkTranslations(baseLanguage, compareLanguage)
  }
})