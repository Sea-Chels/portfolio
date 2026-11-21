import { describe, expect, it } from 'vitest'
import { SECRET_SEQUENCE, advance } from './sequence'

const feed = (keys: string[]) => keys.reduce((p, k) => (p === SECRET_SEQUENCE.length ? p : advance(SECRET_SEQUENCE, p, k)), 0)

describe('secret sequence', () => {
  it('matches the full sequence', () => {
    expect(feed(SECRET_SEQUENCE)).toBe(SECRET_SEQUENCE.length)
  })

  it('survives an extra leading up arrow', () => {
    expect(feed(['ArrowUp', ...SECRET_SEQUENCE])).toBe(SECRET_SEQUENCE.length)
  })

  it('resets on a wrong key', () => {
    expect(advance(SECRET_SEQUENCE, 5, 'a')).toBe(0)
    expect(advance(SECRET_SEQUENCE, 3, 'ArrowUp')).toBe(1)
  })

  it('does not match a near miss', () => {
    expect(feed(SECRET_SEQUENCE.slice(0, 7))).toBe(7)
    expect(feed([...SECRET_SEQUENCE.slice(0, 7), 'ArrowLeft'])).toBeLessThan(SECRET_SEQUENCE.length)
  })
})
