import './Css/App.css'
import '@fontsource/bangers'
import './Css/Comic.css'
import './Css/ComicPages.css'
import { AnnounceProvider } from './a11y/announce'
import ComicMode from './terminal/ComicMode'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import NavBar from './Components/NavBar'
import LandingPage from './Components/LandingPage'
import AboutPage from './Components/AboutPage'
import ArtPage from './Components/ArtPage'
import NotFoundPage from './notFound/NotFoundPage'
import { useRoute } from './routing/useRoute'

function AppContent() {
  const { route, path, navigate } = useRoute()
  const { theme } = useTheme()

  return (
    <div className={`app-root min-h-screen ${theme}`}>
      <NavBar currentPage={route.page} navigate={navigate} />
      <main className="px-6 md:px-10 lg:px-12">
        {route.page === 'dev' && <LandingPage />}
        {route.page === 'about' && <AboutPage />}
        {route.page === 'art' && <ArtPage />}
        {route.page === 'notFound' && <NotFoundPage key={path} path={path} navigate={navigate} />}
      </main>
      <ComicMode />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AnnounceProvider>
        <AppContent />
      </AnnounceProvider>
    </ThemeProvider>
  )
}

export default App
