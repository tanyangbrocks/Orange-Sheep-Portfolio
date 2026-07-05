'use client'

import { motion } from 'framer-motion'
import { useLenis } from 'lenis/react'
import { Link } from '@/i18n/navigation'
import { PhotoCarousel } from '@/components/photo-carousel'

type Stat = { value: string; label: string }

const HEADER_OFFSET_FALLBACK = 72
const OFFSET_BUFFER = 24

export function IntroHero({
  title,
  subtitle,
  description,
  stats,
  photos,
  photoPlaceholder,
  ctaWorks,
  ctaContact,
  ctaInteract
}: {
  title: string
  subtitle: string
  description: string
  stats: Stat[]
  photos: string[]
  photoPlaceholder: string
  ctaWorks: string
  ctaContact: string
  ctaInteract: string
}) {
  const lenis = useLenis()

  function scrollToSection(id: string) {
    return (e: React.MouseEvent) => {
      e.preventDefault()
      const el = document.getElementById(id)
      if (!el) return
      const header = document.querySelector('header')
      const offset = (header?.getBoundingClientRect().height ?? HEADER_OFFSET_FALLBACK) + OFFSET_BUFFER
      lenis?.scrollTo(el, { offset: -offset })
      history.replaceState(null, '', `#${id}`)
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-center">
      <PhotoCarousel photos={photos} placeholder={photoPlaceholder} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="text-xl font-medium text-foreground/80">{subtitle}</p>
        </div>

        <p className="max-w-xl text-muted-foreground">{description}</p>

        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border px-3 py-3">
              <div className="text-2xl font-semibold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Link
              href="/#works"
              onClick={scrollToSection('works')}
              className="block rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm transition-shadow hover:shadow-lg"
            >
              {ctaWorks}
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Link
              href="/#about"
              onClick={scrollToSection('about')}
              className="block rounded-md border px-5 py-2.5 text-sm font-medium shadow-sm transition-shadow hover:shadow-lg"
            >
              {ctaContact}
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            {/* Placeholder — not wired to anything yet, see docs' pending items */}
            <button
              type="button"
              className="block rounded-md border px-5 py-2.5 text-sm font-medium shadow-sm transition-shadow hover:shadow-lg"
            >
              {ctaInteract}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
