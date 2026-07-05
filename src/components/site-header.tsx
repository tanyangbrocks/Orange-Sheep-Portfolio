'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useLenis } from 'lenis/react'
import { Link, usePathname } from '@/i18n/navigation'
import { LanguageSwitcher } from '@/components/language-switcher'

const SECTIONS = ['home', 'experience', 'works', 'about'] as const
type Section = (typeof SECTIONS)[number]
const HEADER_OFFSET = 96

export function SiteHeader() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const lenis = useLenis()
  const isHome = pathname === '/'
  const [active, setActive] = useState<Section>(isHome ? 'home' : 'works')

  // On the home page, highlight whichever section's top has been scrolled past
  // the header line. Walking sections top-to-bottom and taking the last match
  // (rather than an IntersectionObserver ratio) keeps this correct even when
  // the last section is shorter than the viewport, so it can never actually
  // reach "55% into view".
  // On any other route (e.g. a work detail page), "active" just stays at its
  // initial value ('works') since SiteHeader remounts fresh per route.
  useEffect(() => {
    if (!isHome) return

    function updateActive() {
      // Special-case the bottom of the page: a short trailing section's top
      // may never actually reach the header line (there isn't enough scroll
      // distance left), but it's still the one the user is looking at.
      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      if (atBottom) {
        setActive(SECTIONS[SECTIONS.length - 1])
        return
      }

      const scrollLine = window.scrollY + HEADER_OFFSET + 1
      let current: Section = SECTIONS[0]
      for (const id of SECTIONS) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= scrollLine) {
          current = id
        }
      }
      setActive(current)
    }

    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    return () => window.removeEventListener('scroll', updateActive)
  }, [isHome])

  // Arriving at "/#works" etc. from another route: scroll to that section once mounted.
  useEffect(() => {
    if (!isHome) return
    const hash = window.location.hash.replace('#', '')
    if (SECTIONS.includes(hash as Section)) {
      requestAnimationFrame(() => {
        const el = document.getElementById(hash)
        if (el) lenis?.scrollTo(el, { offset: -HEADER_OFFSET })
      })
    }
    // Only run once on mount for the initial hash in the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHome])

  function handleNavClick(section: Section) {
    return (e: React.MouseEvent) => {
      if (!isHome) return // not on the single-page layout, let the Link navigate normally
      e.preventDefault()
      const el = document.getElementById(section)
      if (el) lenis?.scrollTo(el, { offset: -HEADER_OFFSET })
      history.replaceState(null, '', `#${section}`)
      setActive(section)
    }
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/60 px-6 py-4 backdrop-blur">
      <Link href="/#home" onClick={handleNavClick('home')} className="flex items-center gap-2 font-semibold">
        <Image src="/icon.png" alt="" width={28} height={28} className="rounded-full" />
        Orange Sheep
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        {SECTIONS.map((section) => (
          <Link
            key={section}
            href={`/#${section}`}
            onClick={handleNavClick(section)}
            className="relative pb-1"
          >
            {t(section)}
            {active === section && (
              <motion.span
                layoutId="nav-underline"
                className="absolute inset-x-0 -bottom-px h-0.5 bg-foreground"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        ))}
        <LanguageSwitcher />
      </nav>
    </header>
  )
}
