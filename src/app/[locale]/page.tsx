import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { SiteHeader } from '@/components/site-header'
import { WorkCard } from '@/components/work-card'
import { HeroText } from '@/components/hero-text'
import { getFeaturedWorks } from '@/lib/works'
import type { Locale } from '@/i18n/routing'

export default function Home() {
  const t = useTranslations('home')
  const locale = useLocale() as Locale
  const featured = getFeaturedWorks()

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-16">
        <HeroText title={t('heroTitle')} subtitle={t('heroSubtitle')} />

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('featured')}</h2>
            <Link href="/works" className="text-sm underline underline-offset-4">
              {t('viewAll')}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((work) => (
              <WorkCard key={work.slug} work={work} locale={locale} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
