import { useLocale } from 'next-intl'
import { SiteHeader } from '@/components/site-header'
import { WorkCard } from '@/components/work-card'
import { getWorks } from '@/lib/works'
import type { Locale } from '@/i18n/routing'

export default function WorksPage() {
  const locale = useLocale() as Locale
  const items = getWorks()

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Works</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((work) => (
            <WorkCard key={work.slug} work={work} locale={locale} />
          ))}
        </div>
      </main>
    </div>
  )
}
