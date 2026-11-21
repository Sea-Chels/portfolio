import { lazy, Suspense } from 'react'
import '@fontsource/bangers'
import './Css/Comic.css'
import './Css/ComicPages.css'
import { MotionConfig } from 'framer-motion'
import { AnnounceProvider } from './a11y/announce'
import ComicMode from './terminal/ComicMode'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import NavBar from './Components/NavBar'
import LandingPage from './Components/LandingPage'
import { useRoute } from './routing/useRoute'

const AboutPage = lazy(() => import('./Components/AboutPage'))
const ArtPage = lazy(() => import('./Components/ArtPage'))
const NotFoundPage = lazy(() => import('./notFound/NotFoundPage'))

function AppContent() {
  const { route, path, navigate } = useRoute()
  const { theme } = useTheme()

  return (
    <div className={`app-root min-h-screen ${theme}`}>
      <NavBar currentPage={route.page} navigate={navigate} />
      <main className="px-6 md:px-10 lg:px-12">
        <Suspense fallback={<div className="min-h-screen" />}>
          {route.page === 'dev' && <LandingPage />}
          {route.page === 'about' && <AboutPage />}
          {route.page === 'art' && <ArtPage />}
          {route.page === 'notFound' && <NotFoundPage key={path} path={path} navigate={navigate} />}
        </Suspense>
      </main>
      <ComicMode />
    </div>
  )
}

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <AnnounceProvider>
          <AppContent />
        </AnnounceProvider>
      </ThemeProvider>
    </MotionConfig>
  )
}

export default App
