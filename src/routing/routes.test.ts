import { describe, expect, it } from 'vitest'
import { HOME, NOT_FOUND, ROUTES, isPlainClick, navGroup, routeForPage, routeForPath } from './routes'

describe('routeForPath', () => {
  it('finds each page by its path', () => {
    for (const route of ROUTES) expect(routeForPath(route.path)).toBe(route)
  })
  it('ignores trailing slashes and case', () => {
    expect(routeForPath('/about/')?.page).toBe('about')
    expect(routeForPath('/ART')?.page).toBe('art')
    expect(routeForPath('')).toBe(HOME)
  })
  it('keeps the 404 page out of the nav', () => {
    expect(ROUTES).not.toContain(NOT_FOUND)
  })
  it('finds nothing for unknown paths', () => {
    expect(routeForPath('/nope')).toBeNull()
    expect(routeForPath('/about/extra')).toBeNull()
  })
})

describe('navGroup', () => {
  it('keeps Work and About in the main row and tucks Art and Hangout under Other', () => {
    expect(navGroup('main').map((r) => r.page)).toEqual(['dev', 'about'])
    expect(navGroup('other').map((r) => r.page)).toEqual(['art', 'hangout'])
  })
  it('puts every page somewhere in the nav', () => {
    expect([...navGroup('main'), ...navGroup('other')]).toHaveLength(ROUTES.length)
  })
})

describe('routeForPage', () => {
  it('round-trips with routeForPath', () => {
    for (const route of ROUTES) expect(routeForPath(routeForPage(route.page).path)).toBe(route)
  })
})

describe('isPlainClick', () => {
  const plain = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }
  it('handles plain left clicks in the app', () => {
    expect(isPlainClick(plain)).toBe(true)
  })
  it('leaves new-tab and new-window clicks to the browser', () => {
    expect(isPlainClick({ ...plain, metaKey: true })).toBe(false)
    expect(isPlainClick({ ...plain, ctrlKey: true })).toBe(false)
    expect(isPlainClick({ ...plain, shiftKey: true })).toBe(false)
    expect(isPlainClick({ ...plain, button: 1 })).toBe(false)
  })
})
