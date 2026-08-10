'use client'

// Centralised anime.js v4 helpers. Components call these instead of touching
// anime.js directly, so the (v4-specific) API stays in one place and every
// animation respects `prefers-reduced-motion` and only touches compositor props
// (transform/opacity) or text content.

import { animate, svg, stagger, utils } from 'animejs'
import { useEffect, useRef, useState } from 'react'

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Fires once when `ref` first scrolls into view. Returns whether it has been
 * seen yet — drive entrance animations off this.
 */
export function useInView<T extends Element>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true)
            obs.disconnect()
            break
          }
        }
      },
      { threshold: 0.25, ...options },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [options])

  return { ref, inView }
}

/**
 * Tick a numeric counter from 0 → `to`, writing formatted text into `el`.
 * Honours reduced motion (jumps straight to the final value).
 */
export function animateCounter(
  el: HTMLElement,
  to: number,
  opts: { duration?: number; delay?: number; format: (v: number) => string },
) {
  const { duration = 2000, delay = 0, format } = opts
  if (prefersReducedMotion() || to === 0) {
    el.textContent = format(to)
    return
  }
  const state = { v: 0 }
  el.textContent = format(0)
  return animate(state, {
    v: to,
    duration,
    delay,
    ease: 'outExpo',
    onUpdate: () => {
      el.textContent = format(state.v)
    },
  })
}

/**
 * Draw an SVG path left-to-right (stroke-dashoffset under the hood, via v4's
 * drawable proxy). Reduced motion shows the full path immediately.
 */
export function drawPath(
  path: SVGGeometryElement,
  opts: { duration?: number; delay?: number; ease?: string } = {},
) {
  const { duration = 3500, delay = 300, ease = 'inOutQuad' } = opts
  if (prefersReducedMotion()) return
  const [drawable] = svg.createDrawable(path)
  return animate(drawable, { draw: ['0 0', '0 1'], duration, delay, ease })
}

/** Fade in (opacity) a set of elements. Reduced motion shows them at once. */
export function fadeIn(targets: Element | Element[] | string, opts: { duration?: number; delay?: number } = {}) {
  const { duration = 700, delay = 0 } = opts
  if (prefersReducedMotion()) {
    utils.set(targets, { opacity: 1 })
    return
  }
  return animate(targets, { opacity: [0, 1], duration, delay, ease: 'outSine' })
}

/**
 * Staggered entrance (translateY + opacity) for lists/rows/cards. Compositor
 * props only. Reduced motion reveals everything with no movement.
 */
export function staggerIn(
  targets: Element[] | string,
  opts: { y?: number; duration?: number; startDelay?: number; step?: number } = {},
) {
  const { y = 16, duration = 700, startDelay = 80, step = 70 } = opts
  if (prefersReducedMotion()) {
    utils.set(targets, { opacity: 1, translateY: 0 })
    return
  }
  return animate(targets, {
    opacity: [0, 1],
    translateY: [y, 0],
    duration,
    ease: 'outQuad',
    delay: stagger(step, { start: startDelay }),
  })
}

/** Pop-in (scale overshoot) for markers / nodes. Compositor-only. */
export function popIn(targets: Element[] | string, opts: { startDelay?: number; step?: number } = {}) {
  const { startDelay = 200, step = 120 } = opts
  if (prefersReducedMotion()) {
    utils.set(targets, { opacity: 1, scale: 1 })
    return
  }
  return animate(targets, {
    opacity: [0, 1],
    scale: [{ to: 0, duration: 0 }, { to: 1.25, duration: 360, ease: 'outBack' }, { to: 1, duration: 180, ease: 'outQuad' }],
    delay: stagger(step, { start: startDelay }),
  })
}

export { animate, stagger, utils }
