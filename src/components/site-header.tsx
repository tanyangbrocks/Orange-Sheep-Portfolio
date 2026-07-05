'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Menu } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useLenis } from 'lenis/react'
import { Link, usePathname } from '@/i18n/navigation'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

const SECTIONS = ['home', 'experience', 'works', 'about'] as const
type Section = (typeof SECTIONS)[number]

// Extra breathing room below the header line so scrolled-to content doesn't
// start flush against it.
const OFFSET_BUFFER = 24

export function SiteHeader() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const lenis = useLenis()
  const isHome = pathname === '/'
  const [active, setActive] = useState<Section>(isHome ? 'home' : 'works')
  const [mobileOpen, setMobileOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  // Measured header height (+ buffer) used for scroll-spy and scrollTo offset.
  // A ref rather than state since reading it doesn't need to trigger a re-render.
  const headerOffsetRef = useRef(96)

  // The header's rendered height varies by breakpoint (e.g. it used to grow on
  // mobile when nav text wrapped, before the hamburger menu existed) and could
  // change again in the future, so measure it instead of assuming a constant.
  useEffect(() => {
    const el = headerRef.current
    if (!el) return

    function measure() {
      if (el) headerOffsetRef.current = el.offsetHeight + OFFSET_BUFFER
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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

      const scrollLine = window.scrollY + headerOffsetRef.current + 1
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
        if (el) lenis?.scrollTo(el, { offset: -headerOffsetRef.current })
      })
    }
    // Only run once on mount for the initial hash in the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHome])

  function handleNavClick(section: Section) {
    return (e: React.MouseEvent) => {
      setMobileOpen(false)
      if (!isHome) return // not on the single-page layout, let the Link navigate normally
      e.preventDefault()
      const el = document.getElementById(section)
      if (el) lenis?.scrollTo(el, { offset: -headerOffsetRef.current })
      history.replaceState(null, '', `#${section}`)
      setActive(section)
    }
  }

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/60 px-6 py-4 backdrop-blur"
    >
      <Link href="/#home" onClick={handleNavClick('home')} className="flex items-center gap-2 font-semibold">
        <Image src="/icon.png" alt="" width={28} height={28} priority className="rounded-full" />
        Orange Sheep
      </Link>

      <nav className="hidden items-center gap-6 text-sm md:flex">
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

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          aria-label="Open menu"
          className="flex h-11 w-11 items-center justify-center md:hidden"
        >
          <Menu className="h-6 w-6" />
        </SheetTrigger>
        <SheetContent side="right" className="flex flex-col gap-1 pt-16">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {SECTIONS.map((section) => (
            <Link
              key={section}
              href={`/#${section}`}
              onClick={handleNavClick(section)}
              className={`flex h-12 items-center px-4 text-base ${
                active === section ? 'font-semibold' : ''
              }`}
            >
              {t(section)}
            </Link>
          ))}
          <div className="px-4 pt-4">
            <LanguageSwitcher />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
