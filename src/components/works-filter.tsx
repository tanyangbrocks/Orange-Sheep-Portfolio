'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { WorkCard } from '@/components/work-card'
import { categories } from '@content/categories'
import type { WorkEntry } from '@/lib/works'
import type { Locale } from '@/i18n/routing'

export function WorksFilter({ works, locale }: { works: WorkEntry[]; locale: Locale }) {
  const t = useTranslations('categories')
  const tWork = useTranslations('work')
  const [category, setCategory] = useState<string>('all')
  const [subcategory, setSubcategory] = useState<string | null>(null)

  const activeCategory = categories.find((c) => c.id === category)

  const filtered = useMemo(() => {
    return works.filter((w) => {
      if (category !== 'all' && w.category !== category) return false
      if (subcategory && w.subcategory !== subcategory) return false
      return true
    })
  }, [works, category, subcategory])

  return (
    <div className="flex flex-col gap-6">
      <Tabs
        value={category}
        onValueChange={(value) => {
          setCategory(value)
          setSubcategory(null)
        }}
      >
        <TabsList>
          <TabsTrigger value="all">{t('all')}</TabsTrigger>
          {categories.map((c) => (
            <TabsTrigger key={c.id} value={c.id}>
              {t(c.id)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {activeCategory?.subcategories && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={subcategory === null ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSubcategory(null)}
          >
            {t('all')}
          </Badge>
          {activeCategory.subcategories.map((sub) => (
            <Badge
              key={sub.id}
              variant={subcategory === sub.id ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSubcategory(sub.id)}
            >
              {sub.name[locale]}
            </Badge>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">{tWork('noResults')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((work) => (
            <WorkCard key={work.slug} work={work} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
