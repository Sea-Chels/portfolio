import { useEffect, useId, useRef, useState, type FocusEvent } from 'react'

/**
 * A button that shows and hides a panel. Escape closes it and returns focus to the button, claiming
 * the key so outer Escape handlers (like leaving full screen) don't also act; a click elsewhere or
 * focus moving out of `root` closes it too.
 */
export function useDisclosure() {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!(e.target instanceof Node) || !root.current?.contains(e.target)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      setOpen(false)
      button.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const onBlur = (e: FocusEvent<HTMLElement>) => {
    if (!(e.relatedTarget instanceof Node) || !e.currentTarget.contains(e.relatedTarget)) setOpen(false)
  }

  const toggle = () => setOpen((was) => !was)
  const close = () => setOpen(false)

  /** Closes the panel and puts focus back on its button. */
  const dismiss = () => {
    setOpen(false)
    button.current?.focus()
  }

  return { open, toggle, dismiss, close, root, button, panelId, onBlur }
}
