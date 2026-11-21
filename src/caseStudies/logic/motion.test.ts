import { describe, expect, it } from 'vitest'
import { arcLift, createTweens, easeInOutCubic, easeOutBack } from './motion'

describe('motion', () => {
  it('eases start at 0 and end at 1', () => {
    for (const e of [easeInOutCubic, easeOutBack]) {
      expect(e(0)).toBeCloseTo(0)
      expect(e(1)).toBeCloseTo(1)
    }
  })

  it('overshoots with easeOutBack but not easeInOutCubic', () => {
    const samples = Array.from({ length: 101 }, (_, i) => i / 100)
    expect(Math.max(...samples.map(easeOutBack))).toBeGreaterThan(1.05)
    expect(Math.max(...samples.map(easeInOutCubic))).toBeLessThanOrEqual(1)
  })

  it('lifts the camera arc only mid-flight, capped for long flights', () => {
    expect(arcLift(0, 10, 0.5)).toBe(0)
    expect(arcLift(1, 10, 0.5)).toBeCloseTo(0)
    expect(arcLift(0.5, 10, 0.5)).toBeCloseTo(0.5)
    expect(arcLift(0.5, 2, 0.5)).toBeCloseTo(0.24)
  })

  it('runs a tween to completion on the injected clock', () => {
    const tweens = createTweens()
    const seen: number[] = []
    let finished = false
    tweens.add({ duration: 100, ease: (k) => k, update: (k) => seen.push(k), done: () => (finished = true) }, 1000)
    expect(tweens.step(1050)).toBe(true)
    expect(tweens.step(1100)).toBe(false)
    expect(seen).toEqual([0.5, 1])
    expect(finished).toBe(true)
  })

  it('replaces an in-flight tween with the same tag', () => {
    const tweens = createTweens()
    const log: string[] = []
    tweens.add({ duration: 100, tag: 'cam', update: () => log.push('old') }, 0)
    tweens.add({ duration: 100, tag: 'cam', update: () => log.push('new') }, 10)
    tweens.step(50)
    expect(log).toEqual(['new'])
  })

  it('jumps straight to the end when motion is reduced', () => {
    const tweens = createTweens(() => true)
    let last = -1
    tweens.add({ duration: 500, update: (k) => (last = k) }, 0)
    expect(tweens.step(0)).toBe(false)
    expect(last).toBe(1)
  })
})
