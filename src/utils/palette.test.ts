import { describe, expect, it } from 'vitest'
import { parseChannels, toHex, toRgb } from './palette'

describe('parseChannels', () => {
  it('reads space-separated channels, ignoring surrounding space', () => {
    expect(parseChannels(' 255 122 100 ', '--accent-rgb')).toEqual([255, 122, 100])
  })
  it('fails loudly on a missing or malformed token', () => {
    expect(() => parseChannels('', '--missing-rgb')).toThrow(/--missing-rgb/)
    expect(() => parseChannels('255 122', '--short-rgb')).toThrow()
    expect(() => parseChannels('255 122 300', '--big-rgb')).toThrow()
    expect(() => parseChannels('#ff7a64', '--hex-rgb')).toThrow()
  })
})

describe('conversions', () => {
  it('packs channels into a hex number for three.js', () => {
    expect(toHex([0x16, 0x11, 0x1f])).toBe(0x16111f)
  })
  it('formats channels as a CSS color', () => {
    expect(toRgb([255, 122, 100])).toBe('rgb(255 122 100)')
  })
})
