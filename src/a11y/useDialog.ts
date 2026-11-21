import { useEffect, useRef, type RefObject } from 'react'
import { must } from '../utils/must'

/**
 * While `open`, a dialog owns the page behind it: no scrolling, nothing reachable, Escape closes it,
 * and focus starts on `initialFocus` and returns to whatever opened it. The dialog must render
 * outside #root (a portal to body) or it would be made inert along with the page.
 */
export function useDialog(open: boolean, initialFocus: RefObject<HTMLElement | null>, onClose: () => void) {
  const close = useRef(onClose)
  useEffect(() => {
    close.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const root = must(document.getElementById('root'), '#root element')
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    root.inert = true
    initialFocus.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      root.inert = false
      opener?.focus()
    }
  }, [open, initialFocus])
}
