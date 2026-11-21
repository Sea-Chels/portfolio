import { describe, expect, it } from 'vitest'
import { MAX_QUEUED_TURNS, queueTurn, takeTurn } from './turnQueue'

describe('queueTurn', () => {
  it('counts presses in each direction', () => {
    expect(queueTurn(0, 1)).toBe(1)
    expect(queueTurn(1, 1)).toBe(2)
    expect(queueTurn(0, -1)).toBe(-1)
  })
  it('lets opposite presses cancel out', () => {
    expect(queueTurn(1, -1)).toBe(0)
  })
  it('caps how many turns can wait', () => {
    expect(queueTurn(MAX_QUEUED_TURNS, 1)).toBe(MAX_QUEUED_TURNS)
    expect(queueTurn(-MAX_QUEUED_TURNS, -1)).toBe(-MAX_QUEUED_TURNS)
  })
})

describe('takeTurn', () => {
  it('plays queued turns one at a time in their direction', () => {
    expect(takeTurn(2)).toEqual({ direction: 1, rest: 1 })
    expect(takeTurn(-1)).toEqual({ direction: -1, rest: 0 })
  })
  it('has nothing to play when the queue is empty', () => {
    expect(takeTurn(0)).toBeNull()
  })
})
