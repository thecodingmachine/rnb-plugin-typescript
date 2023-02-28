import 'react-i18next'
import en from '../src/Translations/resources/en'

declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof en
    }
  }
}
