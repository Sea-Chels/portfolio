import { useEffect, useRef, useState } from 'react'
import { useAnnounce } from '../../a11y/announce'
import { useReducedMotion } from '../../a11y/useReducedMotion'
import { ALL_LAYERS, type Layers } from './toon/material'
import { createToonScene, webglAvailable, type ToonScene, type ViewName } from './toon/scene'

const LAYER_LABEL: Record<keyof Layers, string> = {
  cel: 'Cel bands',
  halftone: 'Halftone shade',
  specular: 'Hard specular',
  metal: 'Horizon reflection',
  ink: 'Ink outlines',
}
const LAYER_KEYS = Object.keys(LAYER_LABEL) as (keyof Layers)[]

const CANVAS_ATTRS = {
  class: 'block h-full w-full cursor-grab touch-none active:cursor-grabbing',
  role: 'img',
  'aria-label': 'A comic-shaded toolbox, chrome ball and cyan ring on a dark stage. Drag to orbit.',
}

export default function ToonDemo() {
  const frameRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<ToonScene | null>(null)
  const reduced = useReducedMotion()
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced
  const [supported] = useState(webglAvailable)
  const [layers, setLayers] = useState<Layers>(ALL_LAYERS)
  const [lidOpen, setLidOpen] = useState(false)
  const [view, setView] = useState<ViewName>('overview')
  const announce = useAnnounce()

  useEffect(() => {
    const frame = frameRef.current
    if (!supported || !frame) return
    const scene = createToonScene(frame, CANVAS_ATTRS, () => reducedRef.current)
    sceneRef.current = scene
    return () => {
      scene.dispose()
      sceneRef.current = null
    }
  }, [supported])

  const toggleLayer = (key: keyof Layers) => {
    const next = { ...layers, [key]: !layers[key] }
    setLayers(next)
    sceneRef.current?.setLayers(next)
    announce(`${LAYER_LABEL[key]} ${next[key] ? 'on' : 'off'}`)
  }

  const toggleLid = () => {
    sceneRef.current?.setLid(!lidOpen)
    setLidOpen(!lidOpen)
    announce(lidOpen ? 'Lid closed' : 'Lid open, wrench lifted out')
  }

  const toggleView = () => {
    const next: ViewName = view === 'overview' ? 'closeup' : 'overview'
    sceneRef.current?.flyTo(next)
    setView(next)
    announce(next === 'closeup' ? 'Camera flew in to the toolbox' : 'Camera flew back out')
  }

  if (!supported) {
    return <p className="text-[var(--text-secondary)]">WebGL isn’t available in this browser, so the 3D demo can’t run here.</p>
  }

  return (
    <div className="space-y-4">
      <div ref={frameRef} className="toon-stage relative aspect-[16/10] overflow-hidden rounded-lg">
        <p className="pointer-events-none absolute bottom-2 right-3 font-mono text-xs text-[rgb(var(--overlay-fg-rgb)/0.5)]">drag to orbit · scroll to zoom</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-hacker btn-sm" onClick={toggleLid}>
          {lidOpen ? 'Close the lid' : 'Open the lid'}
        </button>
        <button type="button" className="btn-hacker btn-sm" onClick={toggleView}>
          {view === 'overview' ? 'Fly in' : 'Fly out'}
        </button>
      </div>

      <div role="group" aria-label="Shading layers" className="flex flex-wrap items-center gap-2">
        <span className="cs-label mr-1">Layers</span>
        {LAYER_KEYS.map((k) => (
          <button key={k} type="button" className="cs-chip" aria-pressed={layers[k]} onClick={() => toggleLayer(k)}>
            {LAYER_LABEL[k]}
          </button>
        ))}
      </div>
    </div>
  )
}
