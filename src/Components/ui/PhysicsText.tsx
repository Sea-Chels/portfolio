import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { isSettled } from './physicsRest'

interface PhysicsTextProps {
  text?: string
  highlightWords?: string[]
  highlightClass?: string
  gravity?: number
  mouseConstraintStiffness?: number
  fontSize?: string
  fontFamily?: string
}

interface Placement {
  x: number
  y: number
  angle: number
}

/** Matter.js 0.20 blocks page scrolling over the canvas with this handler, which its types leave out. */
interface WheelBlockingMouse {
  mousewheel?: EventListener
}

const WALL_THICKNESS = 60
/** How far inside the edges words are pushed back when the box shrinks. */
const EDGE_PADDING = 20

export default function PhysicsText({
  text = 'Hello World',
  highlightWords = [],
  highlightClass = 'text-accent',
  gravity = 0,
  mouseConstraintStiffness = 0.2,
  fontSize = '2rem',
  fontFamily = 'inherit',
}: PhysicsTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layoutRef = useRef<HTMLDivElement>(null)
  const [positions, setPositions] = useState<Placement[]>([])
  const [isReady, setIsReady] = useState(false)

  const words = text.split(' ')

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const layoutElement = layoutRef.current
    if (!container || !canvas || !layoutElement) return

    const { Engine, World, Bodies, Runner, Mouse, MouseConstraint, Body } = Matter

    // The canvas only catches the pointer; its backing size matches its CSS size so Matter.js maps
    // pointer coordinates 1:1.
    canvas.width = container.offsetWidth
    canvas.height = container.offsetHeight

    const engine = Engine.create()
    engine.gravity.y = gravity

    const hidden = { isStatic: true, render: { visible: false } }
    const createWalls = (w: number, h: number) => [
      Bodies.rectangle(w / 2, h + WALL_THICKNESS / 2, w + WALL_THICKNESS * 2, WALL_THICKNESS, hidden),
      Bodies.rectangle(w / 2, -WALL_THICKNESS / 2, w + WALL_THICKNESS * 2, WALL_THICKNESS, hidden),
      Bodies.rectangle(-WALL_THICKNESS / 2, h / 2, WALL_THICKNESS, h, hidden),
      Bodies.rectangle(w + WALL_THICKNESS / 2, h / 2, WALL_THICKNESS, h, hidden),
    ]
    let walls = createWalls(canvas.width, canvas.height)
    World.add(engine.world, walls)

    const containerRect = container.getBoundingClientRect()
    const bodies = [...layoutElement.querySelectorAll('span')].map((el) => {
      const rect = el.getBoundingClientRect()
      return Bodies.rectangle(
        rect.left - containerRect.left + rect.width / 2,
        rect.top - containerRect.top + rect.height / 2,
        rect.width + 8,
        rect.height + 4,
        { restitution: 0.6, friction: 0.1, frictionAir: 0.02 },
      )
    })
    World.add(engine.world, bodies)

    const place = () => setPositions(bodies.map((b) => ({ x: b.position.x, y: b.position.y, angle: b.angle })))
    place()
    setIsReady(true)

    const mouse = Mouse.create(canvas)
    // pixelRatio must match the canvas's backing-buffer scaling. Since we size canvas.width/height to
    // CSS pixels (not CSS × DPR), keep this at 1; otherwise Matter.js divides mouse coords by DPR and
    // the drag point drifts off the cursor.
    mouse.pixelRatio = 1
    const { mousewheel } = mouse as Matter.Mouse & WheelBlockingMouse
    if (mousewheel) canvas.removeEventListener('wheel', mousewheel)

    const grab = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: mouseConstraintStiffness, render: { visible: false } },
    })
    World.add(engine.world, grab)

    // The simulation only runs while something moves: a grab wakes it, and it sleeps once every word
    // has settled and been let go.
    const runner = Runner.create()
    let frame = 0
    const tick = () => {
      place()
      // The button counts as held from the press itself, before Matter.js has attached the grab.
      if (isSettled(bodies, mouse.button === 0 || grab.body !== null)) {
        Runner.stop(runner)
        frame = 0
        return
      }
      frame = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (frame) return
      Runner.run(runner, engine)
      frame = requestAnimationFrame(tick)
    }
    canvas.addEventListener('pointerdown', wake)

    const resizeObserver = new ResizeObserver(() => {
      const w = container.offsetWidth
      const h = container.offsetHeight
      canvas.width = w
      canvas.height = h
      World.remove(engine.world, walls)
      walls = createWalls(w, h)
      World.add(engine.world, walls)
      for (const body of bodies) {
        Body.setPosition(body, {
          x: Math.min(Math.max(body.position.x, EDGE_PADDING), w - EDGE_PADDING),
          y: Math.min(Math.max(body.position.y, EDGE_PADDING), h - EDGE_PADDING),
        })
      }
      wake()
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      canvas.removeEventListener('pointerdown', wake)
      cancelAnimationFrame(frame)
      Runner.stop(runner)
      World.clear(engine.world, false)
      Engine.clear(engine)
    }
  }, [text, gravity, mouseConstraintStiffness])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ minHeight: '200px' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />

      {isReady && words.map((word, i) => {
        const pos = positions[i] || { x: 0, y: 0, angle: 0 }
        const isHighlighted = highlightWords.some(
          (hw) => hw.toLowerCase() === word.toLowerCase()
        )
        return (
          <span
            key={i}
            className={`absolute pointer-events-none whitespace-nowrap font-bold text-[var(--text-primary)] ${
              isHighlighted ? highlightClass : ''
            }`}
            style={{
              fontSize,
              fontFamily,
              left: 0,
              top: 0,
              transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%) rotate(${pos.angle}rad)`,
              transformOrigin: 'center center',
              willChange: 'transform',
            }}
          >
            {word}
          </span>
        )
      })}

      {/* Invisible copy laid out by the browser; its word boxes become the bodies' starting places. */}
      <div
        ref={layoutRef}
        className="absolute inset-0 pointer-events-none p-8 flex flex-wrap gap-3 content-start"
        style={{ fontSize, fontFamily, visibility: 'hidden' }}
        aria-hidden="true"
      >
        {words.map((word, i) => (
          <span key={`layout-${i}`} className="inline-block whitespace-nowrap font-bold">
            {word}
          </span>
        ))}
      </div>
    </div>
  )
}
