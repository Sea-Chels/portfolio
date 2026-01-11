import { useState } from 'react'
import './Css/App.css'
import NavBar from './Components/NavBar'
import LandingPage from './Components/LandingPage'
import AboutPage from './Components/AboutPage'
import ArtPage from './Components/ArtPage'

type ThemeMode = 'light' | 'dark'

function App() {
  const [isDevPage, setIsDevPage] = useState(true)
  const [isAboutPage, setIsAboutPage] = useState(false)
  const [isArtPage, setIsArtPage] = useState(false)
  const [themeMod, setThemeMod] = useState<ThemeMode>('light')
  const appClasses = ['App', themeMod]

  return (
    <div className={appClasses.join(' ')}>
      <NavBar
        setIsDevPage={setIsDevPage}
        setIsAboutPage={setIsAboutPage}
        setIsArtPage={setIsArtPage}
        setThemeMod={setThemeMod}
        themeMod={themeMod}
        isDevPage={isDevPage}
      />
      {isDevPage ? <LandingPage themeMod={themeMod} /> : null}
      {isAboutPage ? <AboutPage theme={themeMod} /> : null}
      {isArtPage ? <ArtPage /> : null}
    </div>
  )
}

export default App
