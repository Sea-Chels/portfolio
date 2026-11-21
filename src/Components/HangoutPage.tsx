import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { mountHangout, type HangoutHandle, type Presence } from '@sea-chels/hangout/engine'
import { fallPark } from '@sea-chels/hangout/scenes/fall-park'
import { useAnnounce } from '../a11y/announce'
import { useReducedMotion } from '../a11y/useReducedMotion'
import { must } from '../utils/must'
import SectionMarker from './SectionMarker'
import { presenceText } from './hangoutPresence'

/** The shared park, a Cloudflare Durable Object from the hangout repo. Local dev gets its own room, away from visitors. */
const ROOM_URL = `wss://hangout.sea-chels-hangout.workers.dev/rooms/${import.meta.env.DEV ? 'fall-park-dev' : 'fall-park'}`

function HangoutPage() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const park = useRef<HangoutHandle | null>(null)
  const announce = useAnnounce()
  const reducedMotion = useReducedMotion()
  const initialReducedMotion = useRef(reducedMotion)
  const [presence, setPresence] = useState<Presence>({ status: 'connecting', others: 0 })

  useEffect(() => {
    const handle = mountHangout(must(canvas.current, 'hangout canvas'), {
      scene: fallPark(),
      reducedMotion: initialReducedMotion.current,
      announce,
      room: ROOM_URL,
      onPresence: setPresence,
    })
    park.current = handle
    return () => {
      handle.dispose()
      park.current = null
    }
  }, [announce])

  useEffect(() => {
    park.current?.setReducedMotion(reducedMotion)
  }, [reducedMotion])

  return (
    <div className="min-h-screen py-16">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
        <SectionMarker num="06" />
        <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-4">Hangout</h1>
        <p className="text-lg text-[var(--text-muted)] max-w-2xl">
          A little park for your cursor to hang out in. Kick the leaf piles, shake a tree, and keep an eye out for the
          neighborhood dog.
        </p>
      </motion.section>

      <div className="hangout-stage">
        <canvas ref={canvas} aria-describedby="hangout-help" className="block rounded-xl border border-[var(--border)]" />
        <p className="mt-4 font-mono text-sm text-accent">{presenceText(presence)}</p>
        <p id="hangout-help" className="mt-2 text-[var(--text-secondary)]">
          Everyone else on this page shows up as a colored cursor. Click or tap to play. With a keyboard, focus the
          park, use the arrow keys to move (hold Shift to go faster) and press Enter to kick leaves or shake a tree.
        </p>
      </div>
    </div>
  )
}

export default HangoutPage
