import { useTheme } from '../context/ThemeContext'
import type { MouseEvent } from 'react'
import GlassSurface from './ui/GlassSurface'
import { HOME, followInApp, navGroup, type NavRoute, type NavigablePage, type Page } from '../routing/routes'
import NavOther from './NavOther'
import { navLinkClasses } from './navLink'

interface NavBarProps {
  currentPage: Page
  navigate: (page: NavigablePage) => void
}

function NavBar({ currentPage, navigate }: NavBarProps) {
  const { theme, toggleTheme } = useTheme()

  /** Real links, so they open in new tabs; a plain click switches pages without reloading. */
  const follow = (route: NavRoute) => (e: MouseEvent<HTMLAnchorElement>) =>
    followInApp(e, () => {
      // WORK while already on the home page jumps to the case studies.
      if (route.page === 'dev' && currentPage === 'dev') {
        document.getElementById('web-projects')?.scrollIntoView({ behavior: 'smooth' })
        return
      }
      navigate(route.page)
    })

  return (
    <nav className="sticky top-0 z-[var(--layer-nav)]">
      <GlassSurface
        width="100%"
        height={72}
        borderRadius={0}
        backgroundOpacity={0.55}
        blur={11}
        contentClassName="w-full h-full rounded-[inherit] relative z-10"
        style={{ boxShadow: 'none', border: 'none' }}
        // The bar's corners are square, so nothing needs clipping, and the Other menu hangs below it.
        className="overflow-visible!"
      >
        <div className="w-full h-full flex items-center px-4 sm:px-6 md:px-10 lg:px-12">
          <div className="page-width flex-1 flex items-center justify-between">
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

          <div className="flex items-center sm:gap-1">
            {navGroup('main').map((route) => {
              const isActive = currentPage === route.page
              return (
                <a
                  key={route.page}
                  href={route.path}
                  onClick={follow(route)}
                  aria-current={isActive ? 'page' : undefined}
                  className={navLinkClasses(isActive)}
                >
                  {route.label}
                </a>
              )
            })}
            <NavOther routes={navGroup('other')} currentPage={currentPage} follow={follow} />

            <button
              onClick={toggleTheme}
              className="ml-1 sm:ml-4 p-1.5 sm:p-2 rounded-lg border border-[var(--border)] hover:border-accent hover:text-accent transition-all duration-200"
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
