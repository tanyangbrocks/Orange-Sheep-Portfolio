'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="flex items-center gap-1 text-sm">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => router.replace(pathname, { locale: l })}
          className={
            l === locale
              ? 'font-semibold underline underline-offset-4'
              : 'text-muted-foreground hover:text-foreground'
          }
        >
          {l}
        </button>
      ))}
    </div>
  )
}
