import type { Locale } from '@/i18n/routing'

// Native display names for the language menu. Fixed UI chrome, not
// translated content, so this lives outside messages/*.json.
export const localeLabels: Record<Locale, string> = {
  'zh-TW': '繁體中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  ru: 'Русский',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español'
}
