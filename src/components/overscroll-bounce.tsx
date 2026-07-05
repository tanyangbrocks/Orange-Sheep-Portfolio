'use client'

import { useEffect, useRef } from 'react'
import { useLenis } from 'lenis/react'
import { motion, useMotionValue, animate } from 'framer-motion'

// Lenis drives scrolling itself, which suppresses the browser's native
// rubber-band bounce at the top/bottom of the page. This recreates that
// "pulled, then springs back" feel manually: while overscrolling past a
// boundary, translate the whole tree with resistance; once the gesture
// ends (or wheel input goes idle), spring it back to 0.
const MAX_PULL = 80
const RESISTANCE = 0.4
const WHEEL_IDLE_MS = 150
// Lenis's resting scroll value isn't always exactly 0/limit (its internal
// lerp can leave a few px of residual offset), so boundary checks need a
// tolerance rather than an exact comparison.
const BOUNDARY_TOLERANCE = 12

export function OverscrollBounce({ children }: { children: React.ReactNode }) {
  const lenis = useLenis()
  const y = useMotionValue(0)
  const pullRef = useRef(0)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    function atTop() {
      return (lenis?.scroll ?? window.scrollY) <= BOUNDARY_TOLERANCE
    }

    function atBottom() {
      const limit = lenis?.limit ?? document.documentElement.scrollHeight - window.innerHeight
      return (lenis?.scroll ?? window.scrollY) >= limit - BOUNDARY_TOLERANCE
    }

    function clampPull(value: number) {
      return Math.max(-MAX_PULL, Math.min(MAX_PULL, value))
    }

    function release() {
      pullRef.current = 0
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 28 })
    }

    function scheduleRelease() {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(release, WHEEL_IDLE_MS)
    }

    function onWheel(e: WheelEvent) {
      const pullingDown = e.deltaY < 0 && atTop()
      const pullingUp = e.deltaY > 0 && atBottom()
      if (!pullingDown && !pullingUp) return

      e.preventDefault()
      pullRef.current = clampPull(pullRef.current - e.deltaY * RESISTANCE)
      y.set(pullRef.current)
      scheduleRelease()
    }

    let touchStartY = 0
    let overscrolling = false

    function onTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0].clientY
      overscrolling = false
    }

    function onTouchMove(e: TouchEvent) {
      const diff = e.touches[0].clientY - touchStartY
      if (!overscrolling) {
        if (diff > 0 && atTop()) overscrolling = true
        else if (diff < 0 && atBottom()) overscrolling = true
        else return
      }
      e.preventDefault()
      pullRef.current = clampPull(diff * RESISTANCE)
      y.set(pullRef.current)
    }

    function onTouchEnd() {
      if (overscrolling) release()
      overscrolling = false
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchcancel', onTouchEnd)

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      clearTimeout(idleTimerRef.current)
    }
  }, [lenis, y])

  return (
    <motion.div style={{ y }} className="flex flex-1 flex-col">
      {children}
    </motion.div>
  )
}
