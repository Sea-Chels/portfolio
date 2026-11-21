import { describe, expect, it } from 'vitest'
import { presenceText } from './hangoutPresence'

describe('presenceText', () => {
  it('counts the other visitors', () => {
    expect(presenceText({ status: 'open', others: 0 })).toBe("It's just you in the park right now.")
    expect(presenceText({ status: 'open', others: 1 })).toBe('You and 1 other person are in the park.')
    expect(presenceText({ status: 'open', others: 4 })).toBe('You and 4 other people are in the park.')
  })
  it('explains when the park is solo', () => {
    expect(presenceText({ status: 'offline', others: 0 })).toMatch(/just you/)
    expect(presenceText({ status: 'full', others: 0 })).toMatch(/full/)
  })
})
