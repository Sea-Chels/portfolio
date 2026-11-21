import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = 'portfolio-theme'
const PREFERS_LIGHT = '(prefers-color-scheme: light)'

/** The theme the visitor picked, if storage is available and holds one. */
function storedTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'dark' || stored === 'light' ? stored : null
  } catch {
    return null
  }
}

function getInitialTheme(): Theme {
  return storedTheme() ?? (window.matchMedia(PREFERS_LIGHT).matches ? 'light' : 'dark')
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
  }, [theme])

  useEffect(() => {
    const mediaQuery = window.matchMedia(PREFERS_LIGHT)

    // The OS setting only steers visitors who haven't picked a theme themselves.
    const handleChange = (e: MediaQueryListEvent) => {
      if (!storedTheme()) setThemeState(e.matches ? 'light' : 'dark')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  /** Only a choice the visitor makes is remembered; until then the OS setting leads. */
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      window.localStorage.setItem(STORAGE_KEY, newTheme)
    } catch {
      // Without storage the choice lasts until the tab closes.
    }
  }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
