import { describe, expect, it } from 'vitest'
import { formatMm, inchesToMm, parseInches } from './units'

describe('units', () => {
  it.each([
    ['3', 3],
    ['3.25', 3.25],
    ['3/8', 0.375],
    ['3 3/8', 3.375],
    ['3-3/8', 3.375],
    ['1 1/2"', 1.5],
    ['2 in', 2],
    ['  0.5  ', 0.5],
  ])('parses %j', (input, expected) => {
    expect(parseInches(input)).toBe(expected)
  })

  it.each(['', 'abc', '3/0', '1 1/0', '1.5 1/2', '-2', '3//8'])('rejects %j', (input) => {
    expect(parseInches(input)).toBeNull()
  })

  it('converts exactly by the 1959 definition', () => {
    expect(inchesToMm(1)).toBe(25.4)
    expect(formatMm(inchesToMm(3.375))).toBe('85.73 mm')
    expect(formatMm(1e-7)).toBe('0.00 mm')
  })
})
