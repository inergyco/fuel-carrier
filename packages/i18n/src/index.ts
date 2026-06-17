export type { Locales, TranslationFunctions } from './i18n/i18n-types.js'
export { loadAllLocales, loadLocale } from './i18n/i18n-util.sync.js'
export {
  applyDocumentLocale,
  DEFAULT_LOCALE,
  detectLocale,
  getDirection,
  isLocale,
  LOCALE_STORAGE_KEY,
  locales,
} from './locale.js'
