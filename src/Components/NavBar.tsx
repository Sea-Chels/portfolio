import { useTheme } from '../context/ThemeContext'
import type { MouseEvent } from 'react'
import GlassSurface from './ui/GlassSurface'
import { HOME, ROUTES, followInApp, type NavigablePage, type Page, type Route } from '../routing/routes'

interface NavBarProps {
  currentPage: Page
  navigate: (page: NavigablePage) => void
}

function NavBar({ currentPage, navigate }: NavBarProps) {
  const { theme, toggleTheme } = useTheme()

  /** Real links, so they open in new tabs; a plain click switches pages without reloading. */
  const follow = (route: Route<NavigablePage>) => (e: MouseEvent<HTMLAnchorElement>) =>
    followInApp(e, () => {
      // WORK while already on the home page jumps to the case studies.
      if (route.page === 'dev' && currentPage === 'dev') {
        document.getElementById('web-projects')?.scrollIntoView({ behavior: 'smooth' })
        return
      }
      navigate(route.page)
    })

  return (
    <nav className="sticky top-0 z-50">
      <GlassSurface
        width="100%"
        height={72}
        borderRadius={0}
        backgroundOpacity={0.55}
        blur={11}
        contentClassName="w-full h-full rounded-[inherit] relative z-10"
        style={{ boxShadow: 'none', border: 'none' }}
      >
        <div className="w-full h-full flex items-center px-4 sm:px-6 md:px-10 lg:px-12">
          <div className="flex-1 flex items-center justify-between">
          <a
            href={HOME.path}
            onClick={(e) => followInApp(e, () => navigate(HOME.page))}
            aria-label="Chelby Sallady, home"
            className="brand-logo group flex items-center gap-1 font-mono text-xl text-accent hover:text-accent-hover transition-colors"
          >
            <span className="text-[var(--text-muted)] group-hover:text-accent transition-colors">&lt;</span>
            <span>CS</span>
            <span className="text-[var(--text-muted)] group-hover:text-accent transition-colors">/&gt;</span>
          </a>

          <div className="flex items-center gap-1">
            {ROUTES.map((route) => {
              const isActive = currentPage === route.page
              const baseClasses =
                'nav-link px-2 sm:px-4 py-2 font-mono text-sm tracking-wider transition-all duration-200'
              const activeClasses = isActive
                ? 'text-accent border-b-2 border-accent'
                : 'text-[var(--text-secondary)] hover:text-accent'
              return (
                <a
                  key={route.page}
                  href={route.path}
                  onClick={follow(route)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`${baseClasses} ${activeClasses}`}
                >
                  {route.label}
                </a>
              )
            })}

            <button
              onClick={toggleTheme}
              className="ml-2 sm:ml-4 p-2 rounded-lg border border-[var(--border)] hover:border-accent hover:text-accent transition-all duration-200"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          </div>
          </div>
        </div>
      </GlassSurface>
    </nav>
  )
}

export default NavBar
