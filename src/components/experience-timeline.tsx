'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { localize } from '@/lib/works'
import type { ExperienceEntry } from '@/lib/experiences'
import type { Locale } from '@/i18n/routing'

export function ExperienceTimeline({
  items,
  locale
}: {
  items: ExperienceEntry[]
  locale: Locale
}) {
  return (
    <ol className="relative flex flex-col gap-10 border-l pl-6">
      {items.map((item, i) => (
        <motion.li
          key={item.slug}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className="relative"
        >
          <span className="absolute top-1.5 -left-[27px] h-3 w-3 rounded-full bg-foreground ring-4 ring-background" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {item.image && (
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-48"
              >
                <Image
                  src={item.image}
                  alt={localize(item.role, locale)}
                  fill
                  className="object-cover"
                />
              </motion.div>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{localize(item.period, locale)}</span>
              <h3 className="text-lg font-semibold">{localize(item.role, locale)}</h3>
              <p className="text-sm font-medium text-muted-foreground">{item.organization}</p>
              <p className="text-sm text-muted-foreground">{localize(item.description, locale)}</p>
            </div>
          </div>
        </motion.li>
      ))}
    </ol>
  )
}
