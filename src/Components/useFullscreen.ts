import { useEffect, useState, type RefObject } from 'react'
import { inertExcept } from '../a11y/inertExcept'
import { must } from '../utils/must'

const canGoFullscreen = () => document.fullscreenEnabled && typeof HTMLElement.prototype.requestFullscreen === 'function'

/**
 * Shows `target` full screen. Uses the browser's own full screen where it can, and otherwise (iPhone
 * Safari, or a refused request) fills the window with it instead: the rest of the page goes inert
 * and stops scrolling, and Escape leaves unless something inside already used the key. State follows
 * the browser's events rather than the request, so the browser's own Escape and gestures stay in sync.
 */
export function useFullscreen(target: RefObject<HTMLElement | null>) {
  const [native, setNative] = useState(false)
  const [filled, setFilled] = useState(false)

  useEffect(() => {
    const onChange = () => setNative(document.fullscreenElement !== null && document.fullscreenElement === target.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      if (document.fullscreenElement && document.fullscreenElement === target.current) void document.exitFullscreen()
    }
  }, [target])

  useEffect(() => {
    if (!filled) return
    const element = must(target.current, 'full screen target')
    const live = [...document.querySelectorAll('[aria-live]')]
    const restore = inertExcept([element, ...live])
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) setFilled(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      restore()
    }
  }, [filled, target])

  const enter = () => {
    const element = must(target.current, 'full screen target')
    if (canGoFullscreen()) element.requestFullscreen().catch(() => setFilled(true))
    else setFilled(true)
  }

  const exit = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    setFilled(false)
  }

  return { full: native || filled, enter, exit }
}
