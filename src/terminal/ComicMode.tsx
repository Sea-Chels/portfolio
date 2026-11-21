import { useEffect, useRef, useState } from 'react'
import { useAnnounce } from '../a11y/announce'
import { useReducedMotion } from '../a11y/useReducedMotion'
import { isEditableTarget } from './dom'
import { SECRET_SEQUENCE, advance } from './sequence'
import { COMIC_CLASS } from './useComicMode'

const BURST_MS = 1000

/** ↑ ↑ ↓ ↓ ← → ← → toggles a comic-book restyle of the site, borrowed from the DIY app's look. */
export default function ComicMode() {
  const [on, setOn] = useState(false)
  const [burst, setBurst] = useState<{ id: number; word: string } | null>(null)
  const onRef = useRef(false)
  const reduced = useReducedMotion()
  const announce = useAnnounce()

  useEffect(() => {
    let progress = 0
    const onKey = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return
      progress = advance(SECRET_SEQUENCE, progress, e.key)
      if (progress < SECRET_SEQUENCE.length) return
      progress = 0
      const next = !onRef.current
      onRef.current = next
      setOn(next)
      setBurst({ id: Date.now(), word: next ? 'POW!' : 'POOF!' })
      announce(next ? 'Comic mode on. Enter the code again to turn it off.' : 'Comic mode off.')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [announce])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle(COMIC_CLASS, on)
    return () => root.classList.remove(COMIC_CLASS)
  }, [on])

  useEffect(() => {
    if (!burst) return
    const timer = window.setTimeout(() => setBurst(null), BURST_MS)
    return () => window.clearTimeout(timer)
  }, [burst])

  if (!burst || reduced) return null
  return (
    <div key={burst.id} aria-hidden>
      <div className="comic-wipe" />
      <div className="comic-burst">
        <div>
          <span>{burst.word}</span>
        </div>
      </div>
    </div>
  )
}
