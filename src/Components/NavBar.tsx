import '../Css/App.css'
import { Switch, Tooltip } from 'antd'
import ScrollIntoView from 'react-scroll-into-view'

type ThemeMode = 'light' | 'dark'

interface NavBarProps {
  setIsDevPage: (value: boolean) => void
  setIsAboutPage: (value: boolean) => void
  setIsArtPage: (value: boolean) => void
  setThemeMod: (value: ThemeMode) => void
  themeMod: ThemeMode
  isDevPage: boolean
}

function NavBar({
  setIsDevPage,
  setIsAboutPage,
  setIsArtPage,
  setThemeMod,
  themeMod,
  isDevPage,
}: NavBarProps) {
  const onNavClick = (button: string) => {
    if (button === 'dev') {
      setIsDevPage(true)
      setIsAboutPage(false)
      setIsArtPage(false)
    } else if (button === 'about') {
      setIsDevPage(false)
      setIsAboutPage(true)
      setIsArtPage(false)
    } else {
      setIsDevPage(false)
      setIsAboutPage(false)
      setIsArtPage(true)
    }
  }

  const switchColor = themeMod === 'dark' ? 'light' : 'dark'

  return (
    <div className="NavBar">
      <div className="home-identifier">Chelby Sallady</div>
      <div className="nav-buttons">
        {isDevPage ? (
          <ScrollIntoView className="nav-scroll-container" selector="#web-projects">
            <button className="nav">WORK</button>
          </ScrollIntoView>
        ) : (
          <button className="nav" onClick={() => onNavClick('dev')}>
            WORK
          </button>
        )}
        <button className="nav" onClick={() => onNavClick('about')}>
          ABOUT ME
        </button>
        <button className="nav" onClick={() => onNavClick('art')}>
          ILLUSTRATION
        </button>
      </div>
      <Tooltip title="Change theme" color="rgb(28, 28, 30);">
        <Switch
          size="small"
          className={` ${switchColor} theme`}
          defaultChecked
          onChange={() => {
            if (themeMod === 'dark') setThemeMod('light')
            if (themeMod === 'light') setThemeMod('dark')
          }}
        />
      </Tooltip>
    </div>
  )
}

export default NavBar
