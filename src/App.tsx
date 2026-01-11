import { useState } from 'react'
import './Css/App.css'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import NavBar from './Components/NavBar'
import LandingPage from './Components/LandingPage'
import AboutPage from './Components/AboutPage'
import ArtPage from './Components/ArtPage'

type Page = 'dev' | 'about' | 'art'

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dev')
  const { theme } = useTheme()

  return (
    <div className={`min-h-screen ${theme}`}>
      <NavBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="px-6 md:px-10 lg:px-12">
        {currentPage === 'dev' && <LandingPage themeMod={theme} />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'art' && <ArtPage />}
      </main>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
