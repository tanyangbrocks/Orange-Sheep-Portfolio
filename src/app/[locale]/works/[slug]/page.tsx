import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getCategory } from '@content/categories'
import { getWork, getWorks, localize } from '@/lib/works'
import { routing, type Locale } from '@/i18n/routing'

type Params = { locale: string; slug: string }

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getWorks().map((work) => ({ locale, slug: work.slug }))
  )
}

export async function generateMetadata({
  params
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const work = getWork(slug)
  if (!work) return {}
  return {
    title: localize(work.title, locale as Locale),
    description: localize(work.description, locale as Locale)
  }
}

export default async function WorkDetailPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const work = getWork(slug)
  if (!work) notFound()

  const t = await getTranslations('work')
  const tCategories = await getTranslations('categories')
  const category = getCategory(work.category)
  const l = locale as Locale

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
        <Link href="/#works" className="text-sm text-muted-foreground underline underline-offset-4">
          &larr; {t('back')}
        </Link>

        <div className="flex items-center gap-2">
          {category && <Badge variant="secondary">{tCategories(category.id)}</Badge>}
          {work.subcategory && <Badge variant="outline">{work.subcategory}</Badge>}
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">{localize(work.title, l)}</h1>

        {work.previewImages && work.previewImages.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {work.previewImages.map((src) => (
              <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                <Image src={src} alt={localize(work.title, l)} fill className="object-cover" />
              </div>
            ))}
          </div>
        )}

        <p className="whitespace-pre-line text-muted-foreground">
          {localize(work.description, l)}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {work.downloadUrl && (
            <Button render={<a href={work.downloadUrl} target="_blank" rel="noopener noreferrer" />}>
              {t('download')}
            </Button>
          )}
          {work.links?.map((link) => (
            <Button
              key={link.url}
              variant="outline"
              render={<a href={link.url} target="_blank" rel="noopener noreferrer" />}
            >
              {link.label}
            </Button>
          ))}
        </div>
      </main>
    </div>
  )
}
