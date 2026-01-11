import { useEffect, useRef, useState, useCallback } from 'react'

interface LetterGlitchProps {
  text?: string
  glitchSpeed?: number
  centerVignette?: boolean
  outerVignette?: boolean
  smooth?: boolean
  className?: string
}

export default function LetterGlitch({
  text = 'GLITCH',
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  className = '',
}: LetterGlitchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const letters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'

  const getRandomLetter = useCallback(() => {
    return letters[Math.floor(Math.random() * letters.length)]
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = dimensions.width
    canvas.height = dimensions.height

    const fontSize = Math.min(dimensions.width / 8, dimensions.height / 3)
    const cols = Math.ceil(dimensions.width / (fontSize * 0.6))
    const rows = Math.ceil(dimensions.height / fontSize)

    // Create grid of letters
    const grid: string[][] = []
    for (let row = 0; row < rows; row++) {
      grid[row] = []
      for (let col = 0; col < cols; col++) {
        grid[row][col] = getRandomLetter()
      }
    }

    // Calculate center text position
    const centerRow = Math.floor(rows / 2)
    const startCol = Math.floor((cols - text.length) / 2)

    let animationFrame: number

    const draw = () => {
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * fontSize * 0.6 + fontSize * 0.3
          const y = row * fontSize + fontSize * 0.5

          // Calculate distance from center for vignette effect
          const centerX = dimensions.width / 2
          const centerY = dimensions.height / 2
          const distance = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
          )
          const maxDistance = Math.sqrt(
            Math.pow(centerX, 2) + Math.pow(centerY, 2)
          )
          const normalizedDistance = distance / maxDistance

          // Check if this is part of the center text
          const isCenterText =
            row === centerRow &&
            col >= startCol &&
            col < startCol + text.length

          let alpha: number
          if (isCenterText) {
            alpha = 1
          } else if (outerVignette) {
            alpha = smooth
              ? Math.pow(1 - normalizedDistance, 2) * 0.3
              : normalizedDistance < 0.7
                ? 0.3
                : 0.1
          } else if (centerVignette) {
            alpha = smooth
              ? Math.pow(normalizedDistance, 2) * 0.3
              : normalizedDistance > 0.3
                ? 0.3
                : 0.1
          } else {
            alpha = 0.2
          }

          if (isCenterText) {
            ctx.fillStyle = '#FF7A64'
            ctx.fillText(text[col - startCol], x, y)
          } else {
            // Randomly update letters for glitch effect
            if (Math.random() < 0.02) {
              grid[row][col] = getRandomLetter()
            }
            ctx.fillStyle = `rgba(255, 122, 100, ${alpha})`
            ctx.fillText(grid[row][col], x, y)
          }
        }
      }

      // Add scanlines effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'
      for (let i = 0; i < dimensions.height; i += 2) {
        ctx.fillRect(0, i, dimensions.width, 1)
      }

      animationFrame = requestAnimationFrame(draw)
    }

    const intervalId = setInterval(() => {
      // Trigger occasional full glitch
      if (Math.random() < 0.1) {
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            if (
              !(
                row === centerRow &&
                col >= startCol &&
                col < startCol + text.length
              )
            ) {
              grid[row][col] = getRandomLetter()
            }
          }
        }
      }
    }, glitchSpeed)

    draw()

    return () => {
      cancelAnimationFrame(animationFrame)
      clearInterval(intervalId)
    }
  }, [
    dimensions,
    text,
    glitchSpeed,
    centerVignette,
    outerVignette,
    smooth,
    getRandomLetter,
  ])

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}
