'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { localeLabels } from '@/lib/locale-labels'
import { cn } from '@/lib/utils'

// Each bubble pops in with a slightly later delay than the one above it
// (top first, then the next one just behind it), reading as a small wave
// rather than everything appearing at once. Adding a third/fourth bubble
// later is just another entry in the `bubbles` array below - the stagger
// and animation logic doesn't need to change.
const STAGGER_S = 0.06
const BUBBLE_TRANSITION_S = 0.22

const bubbleMotion = {
  initial: { x: 16, opacity: 0, scale: 0.8 },
  animate: { x: 0, opacity: 1, scale: 1 },
  exit: { x: 16, opacity: 0, scale: 0.8 }
}

type BubbleConfig = {
  id: string
  label: string
  icon: ReactNode
  onClick: () => void
  renderFlyout?: () => ReactNode
}

export function UtilityMenu() {
  const [open, setOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { resolvedTheme, setTheme } = useTheme()
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  function closeAll() {
    setOpen(false)
    setLangMenuOpen(false)
  }

  useEffect(() => {
    if (!open) return

    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) closeAll()
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeAll()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const bubbles: BubbleConfig[] = [
    {
      id: 'theme',
      label: resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
      icon: resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
      onClick: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    },
    {
      id: 'language',
      label: 'Change language',
      icon: <span className="text-xs font-semibold uppercase">{locale.slice(0, 2)}</span>,
      onClick: () => setLangMenuOpen((v) => !v),
      renderFlyout: () => (
        <div className="flex w-40 flex-col overflow-hidden rounded-lg border bg-card py-1 shadow-lg">
          {routing.locales.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                router.replace(pathname, { locale: l })
                closeAll()
              }}
              className={cn(
                'tap-bounce px-3 py-2 text-left text-sm hover:bg-muted',
                l === locale ? 'font-semibold text-highlight' : 'text-foreground'
              )}
            >
              {localeLabels[l]}
            </button>
          ))}
        </div>
      )
    }
  ]

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Open theme and language menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="tap-bounce flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border bg-card shadow-sm hover:bg-muted"
      >
        {/* Icon intentionally left blank for now; reserved for a future
            profile/brand image (e.g. <Image fill .../> dropped in here). */}
      </button>

      <AnimatePresence>
        {open && (
          <div className="absolute top-full right-0 z-20 mt-2 flex flex-col items-end gap-2">
            {bubbles.map((bubble, i) => (
              <div key={bubble.id} className="relative">
                <motion.button
                  type="button"
                  aria-label={bubble.label}
                  onClick={bubble.onClick}
                  initial={bubbleMotion.initial}
                  animate={bubbleMotion.animate}
                  exit={bubbleMotion.exit}
                  transition={{ duration: BUBBLE_TRANSITION_S, delay: i * STAGGER_S }}
                  className="tap-bounce flex h-10 w-10 items-center justify-center rounded-full border bg-card shadow-sm hover:bg-muted"
                >
                  {bubble.icon}
                </motion.button>

                {bubble.renderFlyout && (
                  <AnimatePresence>
                    {langMenuOpen && (
                      <motion.div
                        initial={{ x: 16, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 16, opacity: 0 }}
                        transition={{ duration: BUBBLE_TRANSITION_S }}
                        className="absolute top-0 right-full mr-2"
                      >
                        {bubble.renderFlyout()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
