import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['zh-TW', 'en', 'ja', 'ko', 'ru', 'de', 'fr', 'es'],
  defaultLocale: 'zh-TW'
})

export type Locale = (typeof routing.locales)[number]
