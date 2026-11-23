import { useEffect, useRef, useState } from 'react'
import { useAnnounce } from '../a11y/announce'
import { NOT_FOUND, routeForPage, routeForPath, type NavigablePage, type Route } from './routes'

interface Location {
  route: Route
  /** The path as visited; for the 404 page it's the missing one. */
  path: string
}

const locate = (path: string): Location => ({ route: routeForPath(path) ?? NOT_FOUND, path })

/**
 * The current page, kept in the URL with the History API. Navigating never reloads the document,
 * so app-wide state (like comic mode) survives page changes but not a refresh.
 */
export function useRoute(): Location & { navigate: (page: NavigablePage) => void } {
  const [location, setLocation] = useState(() => locate(window.location.pathname))
  const current = useRef(location)
  const announce = useAnnounce()

  const arrive = (next: Location) => {
    current.current = next
    setLocation(next)
    window.scrollTo(0, 0)
    announce(next.route === NOT_FOUND ? 'Page not found' : `${next.route.label.toLowerCase()} page`)
  }

  useEffect(() => {
    // In-page anchors (#skills, #contact) add history entries too; only a change of page re-routes.
    const onPop = () => {
      const next = locate(window.location.pathname)
      const prev = current.current
      if (next.route.page !== prev.route.page || (next.route === NOT_FOUND && next.path !== prev.path)) arrive(next)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [arrive])

  useEffect(() => {
    document.title = location.route.title
  }, [location.route])

  const navigate = (page: NavigablePage) => {
    const { path } = routeForPage(page)
    if (path !== window.location.pathname) window.history.pushState(null, '', path)
    arrive(locate(path))
  }

  return { ...location, navigate }
}
