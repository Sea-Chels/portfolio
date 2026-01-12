import { useTheme } from '../context/ThemeContext'
import ScrollIntoView from 'react-scroll-into-view'

type Page = 'dev' | 'about' | 'art'

interface NavBarProps {
  currentPage: Page
  setCurrentPage: (page: Page) => void
}

function NavBar({ currentPage, setCurrentPage }: NavBarProps) {
  const { theme, toggleTheme } = useTheme()

  const navItems: { id: Page; label: string }[] = [
    { id: 'dev', label: 'WORK' },
    { id: 'about', label: 'ABOUT' },
    { id: 'art', label: 'ART' },
  ]

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/80 border-b border-[var(--border)]">
      <div className="mx-auto px-6 md:px-10 lg:px-12 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => setCurrentPage('dev')}
            className="group flex items-center gap-1 font-mono text-xl text-accent hover:text-accent-hover transition-colors"
          >
            <span className="text-[var(--text-muted)] group-hover:text-accent transition-colors">&lt;</span>
            <span>CS</span>
            <span className="text-[var(--text-muted)] group-hover:text-accent transition-colors">/&gt;</span>
          </button>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id
              const baseClasses =
                'px-4 py-2 font-mono text-sm tracking-wider transition-all duration-200'
              const activeClasses = isActive
                ? 'text-accent border-b-2 border-accent'
                : 'text-[var(--text-secondary)] hover:text-accent'

              // Special handling for WORK button when on dev page
              if (item.id === 'dev' && currentPage === 'dev') {
                return (
                  <ScrollIntoView key={item.id} selector="#web-projects">
                    <button className={`${baseClasses} ${activeClasses}`}>
                      {item.label}
                    </button>
                  </ScrollIntoView>
                )
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`${baseClasses} ${activeClasses}`}
                >
                  {item.label}
                </button>
              )
            })}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="ml-4 p-2 rounded-lg border border-[var(--border)] hover:border-accent hover:text-accent transition-all duration-200"
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
    </nav>
  )
}

export default NavBar
