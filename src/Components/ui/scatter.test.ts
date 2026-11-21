import { describe, expect, it } from 'vitest'
import { SCATTER_SPEED, SCATTER_SPIN, scatterKicks } from './scatter'

/** A fixed sequence, so the kicks are reproducible. */
const sequence = (...values: number[]) => {
  let i = 0
  return () => values[i++ % values.length]
}

describe('scatterKicks', () => {
  it('kicks every word', () => {
    expect(scatterKicks(5, Math.random)).toHaveLength(5)
    expect(scatterKicks(0, Math.random)).toEqual([])
  })
  it('keeps every speed and spin within bounds', () => {
    for (const kick of scatterKicks(200, Math.random)) {
      const speed = Math.hypot(kick.x, kick.y)
      expect(speed).toBeGreaterThanOrEqual(SCATTER_SPEED.min - 1e-9)
      expect(speed).toBeLessThanOrEqual(SCATTER_SPEED.max)
      expect(Math.abs(kick.spin)).toBeLessThanOrEqual(SCATTER_SPIN)
    }
  })
  it('points each kick along its random angle', () => {
    const [kick] = scatterKicks(1, sequence(0.25, 0, 0.5))
    expect(kick.x).toBeCloseTo(0)
    expect(kick.y).toBeCloseTo(SCATTER_SPEED.min)
    expect(kick.spin).toBeCloseTo(0)
  })
})
