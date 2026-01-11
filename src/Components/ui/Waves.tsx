import { useEffect, useRef } from 'react'

interface WavesProps {
  lineColor?: string
  backgroundColor?: string
  waveSpeedX?: number
  waveSpeedY?: number
  waveAmpX?: number
  waveAmpY?: number
  friction?: number
  tension?: number
  maxCursorMove?: number
  xGap?: number
  yGap?: number
  className?: string
}

interface Point {
  x: number
  y: number
  originX: number
  originY: number
  vx: number
  vy: number
}

// Simplified Perlin noise implementation
class Noise {
  private permutation: number[]

  constructor(seed = Math.random()) {
    this.permutation = this.generatePermutation(seed)
  }

  private generatePermutation(seed: number): number[] {
    const perm = []
    for (let i = 0; i < 256; i++) perm[i] = i
    for (let i = 255; i > 0; i--) {
      seed = (seed * 16807) % 2147483647
      const j = Math.floor((seed / 2147483647) * (i + 1))
      ;[perm[i], perm[j]] = [perm[j], perm[i]]
    }
    return [...perm, ...perm]
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a)
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 3
    const u = h < 2 ? x : y
    const v = h < 2 ? y : x
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }

  noise2D(x: number, y: number): number {
    const xi = Math.floor(x) & 255
    const yi = Math.floor(y) & 255
    const xf = x - Math.floor(x)
    const yf = y - Math.floor(y)

    const u = this.fade(xf)
    const v = this.fade(yf)

    const aa = this.permutation[this.permutation[xi] + yi]
    const ab = this.permutation[this.permutation[xi] + yi + 1]
    const ba = this.permutation[this.permutation[xi + 1] + yi]
    const bb = this.permutation[this.permutation[xi + 1] + yi + 1]

    const x1 = this.lerp(this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf), u)
    const x2 = this.lerp(
      this.grad(ab, xf, yf - 1),
      this.grad(bb, xf - 1, yf - 1),
      u
    )

    return this.lerp(x1, x2, v)
  }
}

export default function Waves({
  lineColor = 'rgba(255, 122, 100, 0.3)',
  backgroundColor = 'transparent',
  waveSpeedX = 0.02,
  waveSpeedY = 0.01,
  waveAmpX = 40,
  waveAmpY = 20,
  friction = 0.9,
  tension = 0.01,
  maxCursorMove = 120,
  xGap = 12,
  yGap = 36,
  className = '',
}: WavesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return

    const container = containerRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = container.offsetWidth
    let height = container.offsetHeight
    canvas.width = width
    canvas.height = height

    const noise = new Noise()
    const points: Point[][] = []
    const mouse = { x: width / 2, y: height / 2, vx: 0, vy: 0 }
    let prevMouse = { x: width / 2, y: height / 2 }
    let time = 0
    let animationFrame: number

    const initPoints = () => {
      points.length = 0
      const cols = Math.ceil(width / xGap) + 1
      const rows = Math.ceil(height / yGap) + 1

      for (let row = 0; row < rows; row++) {
        points[row] = []
        for (let col = 0; col < cols; col++) {
          const x = col * xGap
          const y = row * yGap
          points[row][col] = {
            x,
            y,
            originX: x,
            originY: y,
            vx: 0,
            vy: 0,
          }
        }
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.vx = mouse.x - prevMouse.x
      mouse.vy = mouse.y - prevMouse.y
      prevMouse.x = mouse.x
      prevMouse.y = mouse.y
    }

    const handleResize = () => {
      width = container.offsetWidth
      height = container.offsetHeight
      canvas.width = width
      canvas.height = height
      initPoints()
    }

    const draw = () => {
      ctx.fillStyle = backgroundColor
      if (backgroundColor === 'transparent') {
        ctx.clearRect(0, 0, width, height)
      } else {
        ctx.fillRect(0, 0, width, height)
      }

      time += 1

      // Update points
      for (let row = 0; row < points.length; row++) {
        for (let col = 0; col < points[row].length; col++) {
          const point = points[row][col]

          // Noise-based wave movement
          const noiseX = noise.noise2D(
            point.originX * 0.005 + time * waveSpeedX,
            point.originY * 0.005
          )
          const noiseY = noise.noise2D(
            point.originX * 0.005,
            point.originY * 0.005 + time * waveSpeedY
          )

          // Target position with wave
          const targetX = point.originX + noiseX * waveAmpX
          const targetY = point.originY + noiseY * waveAmpY

          // Mouse influence
          const dx = mouse.x - point.x
          const dy = mouse.y - point.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < maxCursorMove) {
            const force = (1 - dist / maxCursorMove) * 0.5
            point.vx += mouse.vx * force
            point.vy += mouse.vy * force
          }

          // Apply tension to return to target
          point.vx += (targetX - point.x) * tension
          point.vy += (targetY - point.y) * tension

          // Apply friction
          point.vx *= friction
          point.vy *= friction

          // Update position
          point.x += point.vx
          point.y += point.vy
        }
      }

      // Draw lines
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 1

      // Horizontal lines
      for (let row = 0; row < points.length; row++) {
        ctx.beginPath()
        for (let col = 0; col < points[row].length; col++) {
          const point = points[row][col]
          if (col === 0) {
            ctx.moveTo(point.x, point.y)
          } else {
            ctx.lineTo(point.x, point.y)
          }
        }
        ctx.stroke()
      }

      // Vertical lines (optional, for grid effect)
      for (let col = 0; col < points[0]?.length; col++) {
        ctx.beginPath()
        for (let row = 0; row < points.length; row++) {
          const point = points[row][col]
          if (row === 0) {
            ctx.moveTo(point.x, point.y)
          } else {
            ctx.lineTo(point.x, point.y)
          }
        }
        ctx.stroke()
      }

      animationFrame = requestAnimationFrame(draw)
    }

    initPoints()
    window.addEventListener('resize', handleResize)
    canvas.addEventListener('mousemove', handleMouseMove)
    draw()

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [
    lineColor,
    backgroundColor,
    waveSpeedX,
    waveSpeedY,
    waveAmpX,
    waveAmpY,
    friction,
    tension,
    maxCursorMove,
    xGap,
    yGap,
  ])

  return (
    <div ref={containerRef} className={`absolute inset-0 ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
