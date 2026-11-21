import { describe, expect, it } from 'vitest'
import { REST_SPEED, REST_SPIN, isSettled } from './physicsRest'

const still = { speed: 0, angularSpeed: 0 }

describe('isSettled', () => {
  it('is settled when nothing moves', () => {
    expect(isSettled([still, still], false)).toBe(true)
    expect(isSettled([], false)).toBe(true)
  })
  it('keeps running while any word moves or spins', () => {
    expect(isSettled([still, { speed: REST_SPEED * 2, angularSpeed: 0 }], false)).toBe(false)
    expect(isSettled([{ speed: 0, angularSpeed: REST_SPIN * 2 }], false)).toBe(false)
  })
  it('keeps running while a word is held, even if it is still', () => {
    expect(isSettled([still], true)).toBe(false)
  })
})
