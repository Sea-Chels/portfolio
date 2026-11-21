export interface Kick {
  x: number
  y: number
  spin: number
}

/** Speeds in Matter.js units (px per 16.7 ms step): fast enough to cross the box, slow enough to read. */
export const SCATTER_SPEED = { min: 6, max: 14 }
export const SCATTER_SPIN = 0.2

/** A kick in a random direction for each word; `random` returns [0, 1) like Math.random. */
export function scatterKicks(count: number, random: () => number): Kick[] {
  return Array.from({ length: count }, () => {
    const angle = random() * Math.PI * 2
    const speed = SCATTER_SPEED.min + random() * (SCATTER_SPEED.max - SCATTER_SPEED.min)
    return { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed, spin: (random() * 2 - 1) * SCATTER_SPIN }
  })
}
