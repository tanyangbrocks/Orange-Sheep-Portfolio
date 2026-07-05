'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MAX_PHOTOS = 5

const variants = {
  enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? '-100%' : '100%', opacity: 0 })
}

export function PhotoCarousel({ photos, placeholder }: { photos: string[]; placeholder: string }) {
  const items = photos.slice(0, MAX_PHOTOS)
  const [[index, direction], setIndex] = useState<[number, number]>([0, 0])

  function go(delta: number) {
    setIndex(([current]) => [(current + delta + items.length) % items.length, delta])
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl border bg-muted shadow-sm transition-shadow hover:shadow-lg"
    >
      {items.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          {placeholder}
        </div>
      ) : (
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={items[index]}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 340px"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      )}

      {items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => go(-1)}
            className="absolute top-1/2 left-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => go(1)}
            className="absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </motion.div>
  )
}
