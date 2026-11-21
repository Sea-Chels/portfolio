import { useEffect, useRef } from 'react'
import {
  PAGE_CURL_MS,
  curlBounds,
  curlFrame,
  easeInOut,
  multiply,
  reflection,
  turnFrame,
  type Matrix,
  type Point,
  type TurnDirection,
} from './curlGeometry'

/** The outgoing page as it looked on screen, captured before the next piece replaces it. */
export interface CurlPage {
  src: string
  /** The page's outer box (its frame included), in viewport px. */
  left: number
  top: number
  width: number
  height: number
  /** Frame widths in px, outermost first: the ink outline, then the paper margin. */
  outline: number
  margin: number
  paper: string
  ink: string
}

/** Reads the page's look from the lightbox image, so the turning copy matches its frame exactly. */
export function capturePage(img: HTMLImageElement): CurlPage {
  const style = getComputedStyle(img)
  const rect = img.getBoundingClientRect()
  const outline = style.outlineStyle === 'none' ? 0 : parseFloat(style.outlineWidth) || 0
  return {
    src: img.currentSrc || img.src,
    left: rect.left - outline,
    top: rect.top - outline,
    width: rect.width + 2 * outline,
    height: rect.height + 2 * outline,
    outline,
    margin: parseFloat(style.borderTopWidth) || 0,
    paper: style.borderTopColor,
    ink: style.outlineColor,
  }
}

const FOLD_SHADE_PX = 36
const CAST_SHADOW_PX = 48
const SHOW_THROUGH = 0.12
const FADE_FROM = 0.85

interface Props {
  page: CurlPage
  direction: TurnDirection
  onDone: () => void
}

/** Draws the outgoing page curling over its corner to reveal the next piece underneath. */
export default function PageCurl({ page, direction, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const done = useRef(onDone)
  done.current = onDone

  const { width: w, height: h } = page
  const bounds = curlBounds(w, h, direction)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return done.current()

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(bounds.width * dpr)
    canvas.height = Math.round(bounds.height * dpr)
    const toCanvas: Matrix = [dpr, 0, 0, dpr, -bounds.left * dpr, -bounds.top * dpr]
    const mirror = turnFrame(direction, w)
    const inTurn = multiply(toCanvas, mirror)

    const image = new Image()
    image.src = page.src
    let frame = 0
    let cancelled = false
    let start = 0

    const inset = page.outline + page.margin
    const drawPage = () => {
      ctx.fillStyle = page.ink
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = page.paper
      ctx.fillRect(page.outline, page.outline, w - 2 * page.outline, h - 2 * page.outline)
      ctx.drawImage(image, inset, inset, w - 2 * inset, h - 2 * inset)
    }
    const trace = (polygon: Point[]) => {
      ctx.beginPath()
      polygon.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
      ctx.closePath()
    }
    const set = (m: Matrix) => ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5])
    /** A shade that starts at the fold and fades out along `toward`. */
    const shadeFromFold = (fold: { point: Point }, toward: Point, distance: number, stops: [number, string][]) => {
      const g = ctx.createLinearGradient(
        fold.point.x,
        fold.point.y,
        fold.point.x + toward.x * distance,
        fold.point.y + toward.y * distance,
      )
      stops.forEach(([at, color]) => g.addColorStop(at, color))
      ctx.fillStyle = g
      ctx.fillRect(-2 * w, -2 * h, 5 * w, 5 * h)
    }

    const draw = (now: number) => {
      if (cancelled) return
      if (!start) start = now
      const t = Math.min((now - start) / PAGE_CURL_MS, 1)
      const curl = curlFrame(easeInOut(t), w, h)

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (!curl) {
        set(toCanvas)
        drawPage()
      } else {
        const { fold, flat, lifted } = curl
        const away = { x: -fold.normal.x, y: -fold.normal.y }

        // The page still lying flat, darkening where it starts to bend up.
        ctx.save()
        set(inTurn)
        trace(flat)
        ctx.clip()
        set(toCanvas)
        drawPage()
        set(inTurn)
        shadeFromFold(fold, away, FOLD_SHADE_PX, [[0, 'rgba(0,0,0,0.22)'], [1, 'rgba(0,0,0,0)']])
        ctx.restore()

        // The flap's shadow on the next page, which shows through where the page has lifted.
        ctx.save()
        set(inTurn)
        trace(lifted)
        ctx.clip()
        shadeFromFold(fold, fold.normal, CAST_SHADOW_PX, [[0, 'rgba(0,0,0,0.4)'], [1, 'rgba(0,0,0,0)']])
        ctx.restore()

        // The flap: the lifted part folded over, showing the back of the paper.
        const flapAlpha = t < FADE_FROM ? 1 : (1 - t) / (1 - FADE_FROM)
        const folded = multiply(inTurn, reflection(fold))
        ctx.save()
        ctx.globalAlpha = flapAlpha
        set(folded)
        trace(lifted)
        ctx.shadowColor = 'rgba(0,0,0,0.35)'
        ctx.shadowBlur = 18 * dpr
        ctx.fillStyle = page.paper
        ctx.fill()
        ctx.shadowColor = 'transparent'
        ctx.clip()
        // Thin paper: the art shows through the back, mirrored.
        ctx.globalAlpha = flapAlpha * SHOW_THROUGH
        set(multiply(folded, mirror))
        ctx.drawImage(image, inset, inset, w - 2 * inset, h - 2 * inset)
        ctx.globalAlpha = flapAlpha
        set(folded)
        shadeFromFold(fold, fold.normal, Math.hypot(w, h) / 2, [
          [0, 'rgba(0,0,0,0.25)'],
          [0.15, 'rgba(255,255,255,0)'],
          [0.45, 'rgba(255,255,255,0.18)'],
          [1, 'rgba(0,0,0,0.12)'],
        ])
        trace(lifted)
        ctx.strokeStyle = page.ink
        ctx.lineWidth = Math.max(page.outline, 1) * 2
        ctx.stroke()
        ctx.restore()
      }

      if (t < 1) frame = requestAnimationFrame(draw)
      else done.current()
    }

    image
      .decode()
      .then(() => {
        if (!cancelled) frame = requestAnimationFrame(draw)
      })
      .catch(() => done.current())

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
    // A curl is drawn once for the page it was mounted with; a new turn mounts a new curl.
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed z-20"
      style={{
        left: page.left + bounds.left,
        top: page.top + bounds.top,
        width: bounds.width,
        height: bounds.height,
      }}
    />
  )
}
