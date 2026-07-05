'use client'

import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'

type Stat = { value: string; label: string }

export function IntroHero({
  title,
  subtitle,
  description,
  stats,
  photoPlaceholder,
  ctaWorks,
  ctaContact
}: {
  title: string
  subtitle: string
  description: string
  stats: Stat[]
  photoPlaceholder: string
  ctaWorks: string
  ctaContact: string
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-center">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl border bg-muted text-sm text-muted-foreground"
      >
        {photoPlaceholder}
      </motion.div>

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
          <Link
            href="/#works"
            className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            {ctaWorks}
          </Link>
          <Link
            href="/#about"
            className="rounded-md border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            {ctaContact}
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
