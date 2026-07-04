import { getTranslations, setRequestLocale } from 'next-intl/server'
import { SiteHeader } from '@/components/site-header'
import { WorksFilter } from '@/components/works-filter'
import { getWorks } from '@/lib/works'
import type { Locale } from '@/i18n/routing'

type Props = { params: Promise<{ locale: string }> }

export default async function WorksPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('nav')
  const items = getWorks()

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">{t('works')}</h1>
        <WorksFilter works={items} locale={locale as Locale} />
      </main>
    </div>
  )
}
