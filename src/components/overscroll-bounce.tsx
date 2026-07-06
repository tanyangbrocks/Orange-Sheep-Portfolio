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
const WHEEL_IDLE_MS = 75
// Chrome/Edge trackpad "momentum" scrolling keeps sending a long tail of
// small wheel events (often 1-1.5s worth) after the fingers actually lift.
// Since each one resets the idle timer, the pulled state used to stay
// visually "frozen" for that whole tail before finally springing back. Cap
// how long a single gesture is allowed to hold the pull regardless of how
// long its trailing momentum keeps trickling in.
const MAX_HOLD_MS = 400
// After a forced release (the MAX_HOLD_MS cap kicking in), the same
// momentum tail keeps sending events. Without a cooldown, the very next
// event starts a brand-new "gesture" (pullStartRef was just reset to 0)
// and gets force-released again 400ms later - repeating several times
// over a ~1.5s tail and showing up as multiple extra bounces. Ignore
// wheel input for a bit after a forced release so the rest of the tail
// can die out silently instead of re-triggering the stretch.
const COOLDOWN_MS = 800
// Lenis's resting scroll value isn't always exactly 0/limit (its internal
// lerp can leave a few px of residual offset), so boundary checks need a
// tolerance rather than an exact comparison.
const BOUNDARY_TOLERANCE = 12
// Any scroll-to-boundary gesture's last tick or two naturally lands inside
// BOUNDARY_TOLERANCE (you always pass through position 12, 11, ... 1, 0 on
// the way to the top) - without a dead zone, that final normal tick got
// treated as an overscroll pull and immediately released with a visible
// spring-back, so *every* gentle "scroll all the way to the top and stop"
// gesture bounced even though the user never intended to overscroll. Only
// let the pull become visible (and only then schedule a bounce-back) once
// it's accumulated past this dead zone, i.e. the user kept pushing past the
// boundary rather than just arriving at it.
const DEAD_ZONE = 10

export function OverscrollBounce({ children }: { children: React.ReactNode }) {
  const lenis = useLenis()
  const y = useMotionValue(0)
  const pullRef = useRef(0)
  const pullStartRef = useRef(0)
  const suppressUntilRef = useRef(0)
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

    // Shrinks the raw pull by the dead zone before it's ever shown, so small
    // amounts (the incidental overshoot inherent in any arrival at the
    // boundary) stay invisible; only the excess beyond the dead zone shows.
    function visualPull(raw: number) {
      const sign = Math.sign(raw)
      return sign * Math.max(0, Math.abs(raw) - DEAD_ZONE)
    }

    function release() {
      pullRef.current = 0
      pullStartRef.current = 0
      clearTimeout(idleTimerRef.current)
      animate(y, 0, { type: 'spring', bounce: 0.35, duration: 0.5 })
    }

    function scheduleRelease() {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(release, WHEEL_IDLE_MS)
    }

    function onWheel(e: WheelEvent) {
      const now = performance.now()
      if (now < suppressUntilRef.current) return

      const pullingDown = e.deltaY < 0 && atTop()
      const pullingUp = e.deltaY > 0 && atBottom()
      if (!pullingDown && !pullingUp) return

      e.preventDefault()
      if (pullStartRef.current === 0) pullStartRef.current = now
      pullRef.current = clampPull(pullRef.current - e.deltaY * RESISTANCE)
      y.set(visualPull(pullRef.current))

      if (now - pullStartRef.current > MAX_HOLD_MS) {
        suppressUntilRef.current = now + COOLDOWN_MS
        release()
      } else {
        scheduleRelease()
      }
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
      y.set(visualPull(pullRef.current))
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
