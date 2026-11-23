import { useEffect, useId, useRef, useState, type FocusEvent, type MouseEvent } from 'react'
import type { NavRoute, Page } from '../routing/routes'
import { navLinkClasses } from './navLink'

interface NavOtherProps {
  routes: readonly NavRoute[]
  currentPage: Page
  follow: (route: NavRoute) => (e: MouseEvent<HTMLAnchorElement>) => void
}

/**
 * "Other ▾": a disclosure for the pages that don't need a spot in the main row. Escape closes it and
 * returns focus to the button; a click elsewhere or tabbing past the last link closes it too.
 */
function NavOther({ routes, currentPage, follow }: NavOtherProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const holdsCurrent = routes.some((route) => route.page === currentPage)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!(e.target instanceof Node) || !root.current?.contains(e.target)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      button.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!(e.relatedTarget instanceof Node) || !e.currentTarget.contains(e.relatedTarget)) setOpen(false)
  }

  return (
    <div ref={root} className="relative" onBlur={onBlur}>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((was) => !was)}
        className={`${navLinkClasses(holdsCurrent)} inline-flex items-center gap-1`}
      >
        OTHER
        <svg aria-hidden className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M2.5 4.5 6 8l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <ul id={panelId} hidden={!open} className="nav-other-panel">
        {routes.map((route) => {
          const isActive = route.page === currentPage
          return (
            <li key={route.page}>
              <a
                href={route.path}
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => {
                  setOpen(false)
                  follow(route)(e)
                }}
                className={`nav-other-link ${isActive ? 'text-accent' : 'text-[var(--text-secondary)] hover:text-accent'}`}
              >
                {route.label}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default NavOther
