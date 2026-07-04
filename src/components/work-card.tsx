import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getCategory } from '@content/categories'
import { localize, type WorkEntry } from '@/lib/works'
import type { Locale } from '@/i18n/routing'

export function WorkCard({ work, locale }: { work: WorkEntry; locale: Locale }) {
  const t = useTranslations('categories')
  const category = getCategory(work.category)
  const preview = work.previewImages?.[0]

  return (
    <Card className="overflow-hidden py-0 gap-3">
      {preview && (
        <div className="relative aspect-[4/3] w-full bg-muted">
          <Image src={preview} alt={localize(work.title, locale)} fill className="object-cover" />
        </div>
      )}
      <CardHeader className="px-4 pt-4">
        <div className="flex items-center gap-2">
          {category && <Badge variant="secondary">{t(category.id)}</Badge>}
          {work.subcategory && <Badge variant="outline">{work.subcategory}</Badge>}
        </div>
        <CardTitle>{localize(work.title, locale)}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {localize(work.description, locale)}
        </p>
      </CardContent>
    </Card>
  )
}
