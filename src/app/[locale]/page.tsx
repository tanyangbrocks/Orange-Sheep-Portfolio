import { getTranslations, setRequestLocale } from 'next-intl/server'
import { SiteHeader } from '@/components/site-header'
import { WorksFilter } from '@/components/works-filter'
import { IntroHero } from '@/components/intro-hero'
import { ExperienceTimeline } from '@/components/experience-timeline'
import { getWorks } from '@/lib/works'
import { getExperiences } from '@/lib/experiences'
import type { Locale } from '@/i18n/routing'

type Props = { params: Promise<{ locale: string }> }

export default async function Home({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('home')
  const tNav = await getTranslations('nav')
  const allWorks = getWorks()
  const experiences = getExperiences()

  const stats = [
    { value: t('stat1Value'), label: t('stat1Label') },
    { value: t('stat2Value'), label: t('stat2Label') },
    { value: t('stat3Value'), label: t('stat3Label') }
  ]

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6">
        <div id="home" className="scroll-mt-24 pt-16 pb-16">
          <IntroHero
            title={t('heroTitle')}
            subtitle={t('heroSubtitle')}
            description={t('introDescription')}
            stats={stats}
            photoPlaceholder={t('photoPlaceholder')}
            ctaWorks={t('ctaWorks')}
            ctaContact={t('ctaContact')}
          />
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
