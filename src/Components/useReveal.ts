import { useEffect, useState } from 'react'

/** Flips to true after `delayMs`, for content that fades in once the page has settled; `instant` skips the wait. */
export function useReveal(delayMs: number, instant = false): boolean {
  const [shown, setShown] = useState(instant)
  useEffect(() => {
    if (instant) return setShown(true)
    const timer = window.setTimeout(() => setShown(true), delayMs)
    return () => window.clearTimeout(timer)
  }, [delayMs, instant])
  return shown
}

/** A beat after mount, so a page's entrance plays once its layout is in place. */
export const PAGE_SETTLE_MS = 100
