import { useEffect, useRef, useCallback, useState } from 'react'
import Matter from 'matter-js'

interface PhysicsTextProps {
  text?: string
  highlightWords?: string[]
  highlightClass?: string
  backgroundColor?: string
  gravity?: number
  mouseConstraintStiffness?: number
  fontSize?: string
  fontFamily?: string
}

export default function PhysicsText({
  text = 'Hello World',
  highlightWords = [],
  highlightClass = 'text-accent',
  backgroundColor = 'transparent',
  gravity = 0,
  mouseConstraintStiffness = 0.2,
  fontSize = '2rem',
  fontFamily = 'inherit',
}: PhysicsTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layoutRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const runnerRef = useRef<Matter.Runner | null>(null)
  const renderRef = useRef<Matter.Render | null>(null)
  const bodiesRef = useRef<Matter.Body[]>([])
  const wallsRef = useRef<Matter.Body[]>([])
  const animationRef = useRef<number | null>(null)
  const [positions, setPositions] = useState<{ x: number; y: number; angle: number }[]>([])
  const [isReady, setIsReady] = useState(false)

  const words = text.split(' ')

  const updatePositions = useCallback(() => {
    const newPositions = bodiesRef.current.map((body) => ({
      x: body.position.x,
      y: body.position.y,
      angle: body.angle,
    }))
    setPositions(newPositions)
    animationRef.current = requestAnimationFrame(updatePositions)
  }, [])

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || !layoutRef.current) return

    const container = containerRef.current
    const canvas = canvasRef.current
    const layoutElement = layoutRef.current

    let width = container.offsetWidth
    let height = container.offsetHeight

    // Set canvas size
    canvas.width = width
    canvas.height = height

    const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint, Body } = Matter

    // Create engine
    const engine = Engine.create()
    engineRef.current = engine
    engine.world.gravity.y = gravity

    // Create renderer
    const render = Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: backgroundColor,
      },
    })
    renderRef.current = render

    // Create boundaries
    const wallThickness = 60
    const createWalls = (w: number, h: number) => [
      // Bottom
      Bodies.rectangle(w / 2, h + wallThickness / 2, w + wallThickness * 2, wallThickness, {
        isStatic: true,
        render: { visible: false },
        label: 'wall-bottom'
      }),
      // Top
      Bodies.rectangle(w / 2, -wallThickness / 2, w + wallThickness * 2, wallThickness, {
        isStatic: true,
        render: { visible: false },
        label: 'wall-top'
      }),
      // Left
      Bodies.rectangle(-wallThickness / 2, h / 2, wallThickness, h, {
        isStatic: true,
        render: { visible: false },
        label: 'wall-left'
      }),
      // Right
      Bodies.rectangle(w + wallThickness / 2, h / 2, wallThickness, h, {
        isStatic: true,
        render: { visible: false },
        label: 'wall-right'
      }),
    ]

    const walls = createWalls(width, height)
    wallsRef.current = walls
    World.add(engine.world, walls)

    // Get positions from layout helper
    const wordElements = layoutElement.querySelectorAll('span')
    const bodies: Matter.Body[] = []
    const initialPositions: { x: number; y: number; angle: number }[] = []

    wordElements.forEach((el) => {
      const rect = el.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const x = rect.left - containerRect.left + rect.width / 2
      const y = rect.top - containerRect.top + rect.height / 2

      const body = Bodies.rectangle(x, y, rect.width + 8, rect.height + 4, {
        restitution: 0.6,
        friction: 0.1,
        frictionAir: 0.02,
        render: { visible: false },
      })

      bodies.push(body)
      initialPositions.push({ x, y, angle: 0 })
    })

    bodiesRef.current = bodies
    setPositions(initialPositions)
    setIsReady(true)
    World.add(engine.world, bodies)

    // Set up mouse constraint for dragging
    const mouse = Mouse.create(canvas)
    mouse.pixelRatio = window.devicePixelRatio || 1

    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: mouseConstraintStiffness,
        render: { visible: false },
      },
    })
    World.add(engine.world, mouseConstraint)
    render.mouse = mouse

    // Allow scroll events to pass through to the page
    const handleWheel = () => {
      // Don't prevent default - let the page scroll
    }
    canvas.addEventListener('wheel', handleWheel, { passive: true })

    // Remove the default mouse wheel listener that Matter.js adds
    if (mouse.element) {
      mouse.element.removeEventListener('wheel', (mouse as any).mousewheel)
    }

    // Start engine and renderer
    const runner = Runner.create()
    runnerRef.current = runner
    Runner.run(runner, engine)
    Render.run(render)

    // Start position updates
    animationRef.current = requestAnimationFrame(updatePositions)

    // Handle resize
    const handleResize = () => {
      if (!container || !canvas || !engineRef.current) return

      const newWidth = container.offsetWidth
      const newHeight = container.offsetHeight

      // Update canvas size
      canvas.width = newWidth
      canvas.height = newHeight
      render.options.width = newWidth
      render.options.height = newHeight

      // Remove old walls
      World.remove(engine.world, wallsRef.current)

      // Create new walls with updated dimensions
      const newWalls = createWalls(newWidth, newHeight)
      wallsRef.current = newWalls
      World.add(engine.world, newWalls)

      // Constrain bodies to new bounds
      bodiesRef.current.forEach((body) => {
        const padding = 20
        let newX = body.position.x
        let newY = body.position.y

        // Keep within horizontal bounds
        if (newX < padding) newX = padding
        if (newX > newWidth - padding) newX = newWidth - padding

        // Keep within vertical bounds
        if (newY < padding) newY = padding
        if (newY > newHeight - padding) newY = newHeight - padding

        Body.setPosition(body, { x: newX, y: newY })
      })

      width = newWidth
      height = newHeight
    }

    // Use ResizeObserver for more reliable resize detection
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    // Cleanup
    return () => {
      resizeObserver.disconnect()
      canvas.removeEventListener('wheel', handleWheel)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (renderRef.current) {
        Render.stop(renderRef.current)
      }
      if (runnerRef.current) {
        Runner.stop(runnerRef.current)
      }
      if (engineRef.current) {
        World.clear(engineRef.current.world, false)
        Engine.clear(engineRef.current)
      }
    }
  }, [text, backgroundColor, gravity, mouseConstraintStiffness, updatePositions])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ minHeight: '200px' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />

      {/* Visible words - positioned by physics */}
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

      {/* Layout helper - invisible, used to calculate initial positions */}
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
