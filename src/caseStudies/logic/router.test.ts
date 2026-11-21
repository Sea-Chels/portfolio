import { describe, expect, it } from 'vitest'
import { current, historyReducer, matchRoute, startHistory } from './router'

describe('router', () => {
  it('pushes, goes back and forward like a browser', () => {
    let h = startHistory('/')
    h = historyReducer(h, { type: 'push', path: '/a' })
    h = historyReducer(h, { type: 'push', path: '/b' })
    h = historyReducer(h, { type: 'back' })
    expect(current(h)).toBe('/a')
    h = historyReducer(h, { type: 'forward' })
    expect(current(h)).toBe('/b')
  })

  it('drops forward entries when pushing after going back', () => {
    let h = startHistory('/')
    h = historyReducer(h, { type: 'push', path: '/a' })
    h = historyReducer(h, { type: 'back' })
    h = historyReducer(h, { type: 'push', path: '/c' })
    expect(h.entries).toEqual(['/', '/c'])
  })

  it('ignores a push to the current page and stops at either end', () => {
    const h = startHistory('/')
    expect(historyReducer(h, { type: 'push', path: '/' })).toBe(h)
    expect(historyReducer(h, { type: 'back' })).toBe(h)
    expect(historyReducer(h, { type: 'forward' })).toBe(h)
  })

  it('matches routes to categories', () => {
    const cats = ['illustration', 'photo'] as const
    expect(matchRoute('/', cats)).toBe('all')
    expect(matchRoute('/photo', cats)).toBe('photo')
    expect(matchRoute('/photo/', cats)).toBe('photo')
    expect(matchRoute('/nope', cats)).toBeNull()
  })
})
