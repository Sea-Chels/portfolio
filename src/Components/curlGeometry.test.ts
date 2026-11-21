import { describe, expect, it } from 'vitest'
import {
  apply,
  cornerPath,
  curlBounds,
  curlFrame,
  easeInOut,
  multiply,
  polygonArea,
  reflection,
  turnFrame,
} from './curlGeometry'
import { must } from '../utils/must'

const W = 400
const H = 600

describe('curlFrame', () => {
  it('splits the page into flat and lifted parts that cover it exactly', () => {
    for (const p of [0.1, 0.35, 0.5, 0.8]) {
      const frame = must(curlFrame(p, W, H), 'curl frame')
      expect(polygonArea(frame.flat) + polygonArea(frame.lifted)).toBeCloseTo(W * H, 3)
      expect(polygonArea(frame.lifted)).toBeGreaterThan(0)
    }
  })
  it('lifts nothing at the start and the whole page by the end', () => {
    expect(curlFrame(0, W, H)).toBeNull()
    const end = must(curlFrame(1, W, H), 'curl frame')
    expect(polygonArea(end.flat)).toBeCloseTo(0, 3)
    expect(polygonArea(end.lifted)).toBeCloseTo(W * H, 3)
  })
  it('lifts more of the page as the turn goes on', () => {
    const areas = [0.2, 0.4, 0.6, 0.8].map((p) => polygonArea(must(curlFrame(p, W, H), 'curl frame').lifted))
    expect(areas).toEqual([...areas].sort((a, b) => a - b))
  })
  it('folds the grabbed corner onto its place on the path', () => {
    const p = 0.4
    const { fold } = must(curlFrame(p, W, H), 'curl frame')
    const landed = apply(reflection(fold), { x: W, y: H })
    const target = cornerPath(p, W, H)
    expect(landed.x).toBeCloseTo(target.x)
    expect(landed.y).toBeCloseTo(target.y)
  })
  it('lifts the corner mid-turn, so the fold runs on a diagonal', () => {
    expect(cornerPath(0.5, W, H).y).toBeLessThan(H)
    expect(cornerPath(1, W, H)).toEqual({ x: -W, y: H })
  })
})

describe('matrices', () => {
  it('reflecting twice is the identity', () => {
    const { fold } = must(curlFrame(0.3, W, H), 'curl frame')
    const twice = multiply(reflection(fold), reflection(fold))
    const p = apply(twice, { x: 37, y: 91 })
    expect(p.x).toBeCloseTo(37)
    expect(p.y).toBeCloseTo(91)
  })
  it('mirrors the page for a backward turn and is its own inverse', () => {
    const back = turnFrame(-1, W)
    expect(apply(back, { x: 0, y: 5 })).toEqual({ x: W, y: 5 })
    expect(apply(multiply(back, back), { x: 12, y: 5 })).toEqual({ x: 12, y: 5 })
    expect(turnFrame(1, W)).toEqual([1, 0, 0, 1, 0, 0])
  })
})

describe('curlBounds', () => {
  it('makes room on the side the page turns toward', () => {
    expect(curlBounds(W, H, 1).left).toBeLessThan(-W)
    const back = curlBounds(W, H, -1)
    expect(back.left + back.width).toBeGreaterThan(2 * W)
  })
})

describe('easeInOut', () => {
  it('runs 0 to 1 symmetrically', () => {
    expect(easeInOut(0)).toBe(0)
    expect(easeInOut(1)).toBe(1)
    expect(easeInOut(0.5)).toBeCloseTo(0.5)
  })
})
