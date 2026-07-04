'use client'

import { motion } from 'framer-motion'

export function HeroText({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-3"
    >
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="max-w-xl text-lg text-muted-foreground">{subtitle}</p>
    </motion.section>
  )
}
