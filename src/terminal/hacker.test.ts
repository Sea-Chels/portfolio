import { describe, expect, it } from 'vitest'
import { applyFrames, hack, matrix, ping, progressBar, scan, seeded } from './hacker'

describe('progress bars', () => {
  it('fills proportionally and clamps', () => {
    expect(progressBar('x', 0)).toBe('x [....................]   0%')
    expect(progressBar('x', 50)).toBe('x [##########..........]  50%')
    expect(progressBar('x', 150)).toBe('x [####################] 100%')
  })
})

describe('frames', () => {
  it('overwrite progress lines instead of stacking them', () => {
    const final = applyFrames(['start'], scan())
    expect(final.filter((l) => l.startsWith('scanning ports'))).toEqual([progressBar('scanning ports', 100)])
    expect(final[final.length - 1]).toMatch(/0 vulnerabilities/)
  })

  it('end a hack with access granted, three full bars and no partial ones', () => {
    const final = applyFrames([], hack(''))
    expect(final.filter((l) => l.includes('%'))).toHaveLength(3)
    expect(final.every((l) => !l.includes('%') || l.endsWith('100%'))).toBe(true)
    expect(final).toContain('ACCESS GRANTED')
  })

  it('are deterministic for the same seed', () => {
    expect(ping('a.com')).toEqual(ping('a.com'))
    expect(matrix(1)).toEqual(matrix(1))
    expect(matrix(1)).not.toEqual(matrix(2))
  })

  it('give replace nothing to overwrite on an empty screen', () => {
    expect(applyFrames([], [{ delay: 0, line: 'a', replace: true }])).toEqual(['a'])
  })

  it('seeded noise stays in [0, 1)', () => {
    const rand = seeded('x')
    expect(Array.from({ length: 100 }, rand).every((n) => n >= 0 && n < 1)).toBe(true)
  })
})
