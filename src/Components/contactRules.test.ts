import { describe, expect, it } from 'vitest'
import { COOLDOWN_MS, EMPTY_FIELDS, cooldownEnd, isComplete, isValidEmail } from './contactRules'

describe('isValidEmail', () => {
  it('accepts ordinary addresses', () => {
    expect(isValidEmail('a@b.co')).toBe(true)
  })
  it('rejects addresses missing a part or containing spaces', () => {
    for (const bad of ['', 'a@b', '@b.co', 'a b@c.co', 'a@b .co']) expect(isValidEmail(bad)).toBe(false)
  })
})

describe('isComplete', () => {
  const filled = { name: 'Ada', email: 'ada@example.com', subject: 'Hi', message: 'Hello' }
  it('needs every field and a valid email', () => {
    expect(isComplete(filled)).toBe(true)
    expect(isComplete(EMPTY_FIELDS)).toBe(false)
    expect(isComplete({ ...filled, message: '   ' })).toBe(false)
    expect(isComplete({ ...filled, email: 'nope' })).toBe(false)
  })
})

describe('cooldownEnd', () => {
  const now = 1_000_000_000_000
  it('runs for a week after a send', () => {
    expect(cooldownEnd(String(now - 1000), now)).toBe(now - 1000 + COOLDOWN_MS)
  })
  it('is over once the week has passed', () => {
    expect(cooldownEnd(String(now - COOLDOWN_MS), now)).toBeNull()
  })
  it('ignores missing or garbled values', () => {
    expect(cooldownEnd(null, now)).toBeNull()
    expect(cooldownEnd('soon', now)).toBeNull()
  })
})
