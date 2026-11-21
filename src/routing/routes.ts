export type Page = 'dev' | 'about' | 'art' | 'notFound'
/** Pages the nav can link to: everything but the 404. */
export type NavigablePage = Exclude<Page, 'notFound'>

export interface Route<P extends Page = Page> {
  page: P
  path: string
  label: string
  /** Shown in the tab and announced on arrival. */
  title: string
}

export const SITE_TITLE = 'Chelby Sallady'

export const ROUTES: readonly Route<NavigablePage>[] = [
  { page: 'dev', path: '/', label: 'WORK', title: SITE_TITLE },
  { page: 'about', path: '/about', label: 'ABOUT', title: `About · ${SITE_TITLE}` },
  { page: 'art', path: '/art', label: 'ART', title: `Art · ${SITE_TITLE}` },
]

export const HOME = ROUTES[0]

/** Any path that isn't a page. It keeps the URL it was given; it's not in the nav. */
export const NOT_FOUND: Route = { page: 'notFound', path: '', label: '404', title: `Page not found · ${SITE_TITLE}` }

/** Trailing slashes and case don't matter: `/About/` is the About page. */
const normalize = (pathname: string) => pathname.replace(/\/+$/, '').toLowerCase() || '/'

/** The route for a URL path, or null when nothing lives there. */
export function routeForPath(pathname: string): Route | null {
  const path = normalize(pathname)
  return ROUTES.find((route) => route.path === path) ?? null
}

export function routeForPage(page: NavigablePage): Route<NavigablePage> {
  const route = ROUTES.find((r) => r.page === page)
  if (!route) throw new Error(`No route for page "${page}"`)
  return route
}

interface LinkClick {
  button: number
  metaKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
}

/** A plain left click with no modifier; anything else (new tab, new window) is left to the browser. */
export function isPlainClick(e: LinkClick) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
}

/** Runs `go` in place of following a link, unless the click asked for a new tab or window. */
export function followInApp(e: LinkClick & { preventDefault(): void }, go: () => void) {
  if (!isPlainClick(e)) return
  e.preventDefault()
  go()
}
