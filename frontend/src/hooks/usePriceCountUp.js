import { useEffect, useState, useRef } from 'react'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function usePriceCountUp(target, duration = 800) {
  const [value, setValue] = useState(prefersReducedMotion ? target : 0)
  const started = useRef(false)

  const start = () => {
    if (started.current || prefersReducedMotion) return
    started.current = true

    const startTime = performance.now()
    const tick = (now) => {
      const elapsed  = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(parseFloat((eased * target).toFixed(2)))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  return { value, start }
}
