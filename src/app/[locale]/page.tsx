import { getTranslations, setRequestLocale } from 'next-intl/server'
import { SiteHeader } from '@/components/site-header'
import { WorkCard } from '@/components/work-card'
import { WorksFilter } from '@/components/works-filter'
import { HeroText } from '@/components/hero-text'
import { ExperienceTimeline } from '@/components/experience-timeline'
import { getFeaturedWorks, getWorks } from '@/lib/works'
import { getExperiences } from '@/lib/experiences'
import type { Locale } from '@/i18n/routing'

type Props = { params: Promise<{ locale: string }> }

export default async function Home({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('home')
  const tNav = await getTranslations('nav')
  const featured = getFeaturedWorks()
  const allWorks = getWorks()
  const experiences = getExperiences()

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6">
        <div id="home" className="scroll-mt-24 flex flex-col gap-12 pt-16 pb-16">
          <HeroText title={t('heroTitle')} subtitle={t('heroSubtitle')} />

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">{t('featured')}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((work) => (
                <WorkCard key={work.slug} work={work} locale={locale as Locale} />
              ))}
            </div>
          </section>
        </div>

        <div id="experience" className="scroll-mt-24 flex flex-col gap-6 border-t py-16">
          <h2 className="text-3xl font-semibold tracking-tight">{tNav('experience')}</h2>
          <ExperienceTimeline items={experiences} locale={locale as Locale} />
        </div>

        <div id="works" className="scroll-mt-24 flex flex-col gap-6 border-t py-16">
          <h2 className="text-3xl font-semibold tracking-tight">{tNav('works')}</h2>
          <WorksFilter works={allWorks} locale={locale as Locale} />
        </div>

        <div id="about" className="scroll-mt-24 flex flex-col gap-4 border-t py-16">
          <h2 className="text-3xl font-semibold tracking-tight">{tNav('about')}</h2>
          <p className="text-muted-foreground">Placeholder — content to be added in a later phase.</p>
        </div>
      </main>
    </div>
  )
}
