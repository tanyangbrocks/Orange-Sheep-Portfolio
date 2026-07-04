import { works } from '#velite'
import type { Locale } from '@/i18n/routing'

export type WorkEntry = (typeof works)[number]

export function getWorks(): WorkEntry[] {
  return [...works].sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getFeaturedWorks(): WorkEntry[] {
  return getWorks().filter((w) => w.featured)
}

export function getWorksByCategory(category: string): WorkEntry[] {
  return getWorks().filter((w) => w.category === category)
}

export function getWork(slug: string): WorkEntry | undefined {
  return works.find((w) => w.slug === slug)
}

export function localize(text: Record<string, string>, locale: Locale): string {
  return text[locale] ?? Object.values(text)[0]
}
