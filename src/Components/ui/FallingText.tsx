import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'

interface FallingTextProps {
  text?: string
  highlightWords?: string[]
  highlightClass?: string
  trigger?: 'auto' | 'scroll' | 'click' | 'hover'
  backgroundColor?: string
  wireframes?: boolean
  gravity?: number
  mouseConstraintStiffness?: number
  fontSize?: string
  fontFamily?: string
}

export default function FallingText({
  text = 'Hello World',
  highlightWords = [],
  highlightClass = 'text-accent',
  trigger = 'auto',
  backgroundColor = 'transparent',
  wireframes = false,
  gravity = 1,
  mouseConstraintStiffness = 0.2,
  fontSize = '2rem',
  fontFamily = 'inherit',
}: FallingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const [hasTriggered, setHasTriggered] = useState(trigger === 'auto')

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || !textRef.current)
      return

    const container = containerRef.current
    const canvas = canvasRef.current
    const textElement = textRef.current

    const width = container.offsetWidth
    const height = container.offsetHeight

    const Engine = Matter.Engine
    const Render = Matter.Render
    const World = Matter.World
    const Bodies = Matter.Bodies
    const Runner = Matter.Runner
    const Mouse = Matter.Mouse
    const MouseConstraint = Matter.MouseConstraint

    const engine = Engine.create()
    engineRef.current = engine
    engine.world.gravity.y = gravity

    const render = Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width,
        height,
        wireframes,
        background: backgroundColor,
      },
    })

    // Create ground and walls
    const ground = Bodies.rectangle(width / 2, height + 30, width, 60, {
      isStatic: true,
      render: { visible: false },
    })
    const leftWall = Bodies.rectangle(-30, height / 2, 60, height, {
      isStatic: true,
      render: { visible: false },
    })
    const rightWall = Bodies.rectangle(width + 30, height / 2, 60, height, {
      isStatic: true,
      render: { visible: false },
    })

    World.add(engine.world, [ground, leftWall, rightWall])

    // Create word bodies
    const wordElements = textElement.querySelectorAll('span')
    const bodies: Matter.Body[] = []

    wordElements.forEach((el, i) => {
      const rect = el.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const x = rect.left - containerRect.left + rect.width / 2
      const y = rect.top - containerRect.top + rect.height / 2

      const body = Bodies.rectangle(x, y, rect.width + 10, rect.height + 5, {
        restitution: 0.5,
        friction: 0.3,
        frictionAir: 0.01,
        render: {
          fillStyle: 'transparent',
        },
        label: `word-${i}`,
      })

      bodies.push(body)
    })

    // Mouse interaction
    const mouse = Mouse.create(canvas)
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: mouseConstraintStiffness,
        render: { visible: false },
      },
    })
    World.add(engine.world, mouseConstraint)

    // Run the engine
    const runner = Runner.create()

    // Handle triggering
    const startPhysics = () => {
      if (hasTriggered) {
        World.add(engine.world, bodies)
        Runner.run(runner, engine)
        Render.run(render)
      }
    }

    const handleTrigger = () => {
      setHasTriggered(true)
    }

    if (trigger === 'auto') {
      startPhysics()
    } else if (trigger === 'scroll') {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            handleTrigger()
            observer.disconnect()
          }
        },
        { threshold: 0.5 }
      )
      observer.observe(container)
    } else if (trigger === 'click') {
      container.addEventListener('click', handleTrigger, { once: true })
    } else if (trigger === 'hover') {
      container.addEventListener('mouseenter', handleTrigger, { once: true })
    }

    // Update text positions
    const updatePositions = () => {
      bodies.forEach((body, i) => {
        const el = wordElements[i] as HTMLElement
        if (el) {
          el.style.transform = `translate(${body.position.x - el.offsetWidth / 2}px, ${body.position.y - el.offsetHeight / 2}px) rotate(${body.angle}rad)`
          el.style.position = 'absolute'
          el.style.left = '0'
          el.style.top = '0'
        }
      })
      requestAnimationFrame(updatePositions)
    }

    if (hasTriggered) {
      startPhysics()
      requestAnimationFrame(updatePositions)
    }

    // Handle resize
    const handleResize = () => {
      render.canvas.width = container.offsetWidth
      render.canvas.height = container.offsetHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      Render.stop(render)
      Runner.stop(runner)
      World.clear(engine.world, false)
      Engine.clear(engine)
      render.canvas.remove()
      window.removeEventListener('resize', handleResize)
    }
  }, [
    text,
    trigger,
    backgroundColor,
    wireframes,
    gravity,
    mouseConstraintStiffness,
    hasTriggered,
  ])

  const words = text.split(' ')

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ minHeight: '200px' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div
        ref={textRef}
        className="absolute inset-0"
        style={{
          fontSize,
          fontFamily,
        }}
      >
        {words.map((word, i) => {
          const isHighlighted = highlightWords.some(
            (hw) => hw.toLowerCase() === word.toLowerCase()
          )
          return (
            <span
              key={i}
              className={`inline-block whitespace-nowrap font-bold ${
                isHighlighted ? highlightClass : ''
              }`}
              style={{
                transformOrigin: 'center center',
                willChange: 'transform',
              }}
            >
              {word}
            </span>
          )
        })}
      </div>
    </div>
  )
}
