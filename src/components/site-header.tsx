import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { LanguageSwitcher } from '@/components/language-switcher'

export function SiteHeader() {
  const t = useTranslations('nav')

  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <Link href="/" className="font-semibold">
        Orange Sheep
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        <Link href="/">{t('home')}</Link>
        <Link href="/works">{t('works')}</Link>
        <Link href="/about">{t('about')}</Link>
        <LanguageSwitcher />
      </nav>
    </header>
  )
}
