/** 1 turns forward (next piece), -1 turns back. */
export type TurnDirection = 1 | -1
export type Point = { x: number; y: number }
/** A 2D affine transform in canvas setTransform order: x' = a·x + c·y + e, y' = b·x + d·y + f. */
export type Matrix = [number, number, number, number, number, number]
/** The fold line: a point on it and the unit normal pointing at the lifted side. */
export type Fold = { point: Point; normal: Point }

export const PAGE_CURL_MS = 750
/** How high the grabbed corner rises mid-turn, as a share of page height; this tilts the fold. */
const CORNER_LIFT = 0.35

export const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0]

export const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)

/** Where the grabbed bottom-right corner is at progress t, travelling over the spine to the left. */
export function cornerPath(t: number, w: number, h: number): Point {
  return { x: w - 2 * w * t, y: h - h * CORNER_LIFT * Math.sin(Math.PI * t) }
}

/** The fold that carries `corner` onto `target`: their perpendicular bisector. */
export function foldBetween(corner: Point, target: Point): Fold | null {
  const dx = corner.x - target.x
  const dy = corner.y - target.y
  const length = Math.hypot(dx, dy)
  if (length < 1e-6) return null
  return {
    point: { x: (corner.x + target.x) / 2, y: (corner.y + target.y) / 2 },
    normal: { x: dx / length, y: dy / length },
  }
}

export const sideOf = (p: Point, fold: Fold) =>
  (p.x - fold.point.x) * fold.normal.x + (p.y - fold.point.y) * fold.normal.y

/** Sutherland–Hodgman: the part of a convex polygon on one side of the fold. */
export function clipToSide(polygon: Point[], fold: Fold, lifted: boolean): Point[] {
  const inside = (p: Point) => (lifted ? sideOf(p, fold) >= 0 : sideOf(p, fold) <= 0)
  const out: Point[] = []
  polygon.forEach((current, i) => {
    const previous = polygon[(i + polygon.length - 1) % polygon.length]
    const crossing = () => {
      const a = sideOf(previous, fold)
      const b = sideOf(current, fold)
      const t = a / (a - b)
      return { x: previous.x + (current.x - previous.x) * t, y: previous.y + (current.y - previous.y) * t }
    }
    if (inside(current)) {
      if (!inside(previous)) out.push(crossing())
      out.push(current)
    } else if (inside(previous)) {
      out.push(crossing())
    }
  })
  return out
}

/** Reflection across the fold line: p' = p − 2((p − m)·n)n. */
export function reflection({ point, normal: n }: Fold): Matrix {
  const k = point.x * n.x + point.y * n.y
  return [1 - 2 * n.x * n.x, -2 * n.x * n.y, -2 * n.x * n.y, 1 - 2 * n.y * n.y, 2 * k * n.x, 2 * k * n.y]
}

/** `outer ∘ inner`: apply `inner` first. */
export function multiply(outer: Matrix, inner: Matrix): Matrix {
  const [a1, b1, c1, d1, e1, f1] = outer
  const [a2, b2, c2, d2, e2, f2] = inner
  return [
    a1 * a2 + c1 * b2,
    b1 * a2 + d1 * b2,
    a1 * c2 + c1 * d2,
    b1 * c2 + d1 * d2,
    a1 * e2 + c1 * f2 + e1,
    b1 * e2 + d1 * f2 + f1,
  ]
}

export const apply = ([a, b, c, d, e, f]: Matrix, p: Point): Point => ({ x: a * p.x + c * p.y + e, y: b * p.x + d * p.y + f })

/**
 * The geometry is worked out for a forward turn; a backward turn is the same turn seen in a mirror.
 * Maps page coordinates to the forward-turn frame (and back: it's its own inverse).
 */
export const turnFrame = (direction: TurnDirection, w: number): Matrix => (direction === 1 ? IDENTITY : [-1, 0, 0, 1, w, 0])

export interface CurlFrame {
  fold: Fold
  /** The part of the page still lying flat. */
  flat: Point[]
  /** The part lifted off the page; drawn reflected across the fold, it's the flap. */
  lifted: Point[]
}

/** The turn at eased progress p (0–1), in the forward-turn frame. Null before anything has lifted. */
export function curlFrame(p: number, w: number, h: number): CurlFrame | null {
  const corner = { x: w, y: h }
  const fold = foldBetween(corner, cornerPath(p, w, h))
  if (!fold) return null
  const page = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
  ]
  return { fold, flat: clipToSide(page, fold, false), lifted: clipToSide(page, fold, true) }
}

/** Canvas area around the page that the flap can sweep through, in page coordinates. */
export function curlBounds(w: number, h: number, direction: TurnDirection) {
  const margin = Math.max(w, h) * 0.1 + 24
  const top = -h * 0.6
  const width = 2 * w + 2 * margin
  return { left: direction === 1 ? -w - margin : -margin, top, width, height: h - top + margin }
}

export function polygonArea(polygon: Point[]): number {
  let sum = 0
  polygon.forEach((p, i) => {
    const q = polygon[(i + 1) % polygon.length]
    sum += p.x * q.y - q.x * p.y
  })
  return Math.abs(sum) / 2
}
