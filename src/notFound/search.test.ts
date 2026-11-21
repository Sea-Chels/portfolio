import { describe, expect, it } from 'vitest'
import { SECRET_ATTEMPT, SECRET_HINT, displayPath, searchLines } from './search'

describe('displayPath', () => {
  it('decodes what people typed', () => {
    expect(displayPath('/my%20page')).toBe('/my page')
  })
  it('keeps malformed escapes as typed', () => {
    expect(displayPath('/bad%E0%A4%A')).toBe('/bad%E0%A4%A')
  })
  it('trims very long paths', () => {
    const shown = displayPath(`/${'a'.repeat(100)}`)
    expect(shown.length).toBe(40)
    expect(shown.endsWith('…')).toBe(true)
  })
})

describe('searchLines', () => {
  it('opens with the failed cd, only on the first look', () => {
    expect(searchLines('/nope', 0)[1]).toEqual({ kind: 'output', text: 'cd: no such file or directory: /nope' })
    expect(searchLines('/nope', 1)[0].text).toBe('find / -name "nope"')
  })
  it('searches somewhere new on the second look', () => {
    const first = searchLines('/nope', 0).map((l) => l.text)
    const second = searchLines('/nope', 1).map((l) => l.text)
    expect(second.filter((t) => t.startsWith('searching')).some((t) => first.includes(t))).toBe(false)
  })
  it('ends an ordinary search with no results', () => {
    const lines = searchLines('/nope', 0)
    expect(lines[lines.length - 1].kind).toBe('result')
    expect(lines.some((l) => l.kind === 'secret')).toBe(false)
  })
  it('digs up the comic-mode code on the third look, and every third after', () => {
    for (const attempt of [SECRET_ATTEMPT, SECRET_ATTEMPT * 2 + 1]) {
      const secret = searchLines('/nope', attempt).find((l) => l.kind === 'secret')
      expect(secret?.text).toContain(SECRET_HINT)
    }
  })
  it('spells the code with arrows', () => {
    expect(SECRET_HINT).toBe('↑ ↑ ↓ ↓ ← → ← →')
  })
})
