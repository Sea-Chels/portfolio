import '../Css/LandingPage.css'
import { projects } from '../Media'
import ProjectItem from './ProjectItem'
import { Divider } from 'antd'
import hero from '../Media/motion-graphics/motion_graphic.gif'

type ThemeMode = 'light' | 'dark'

interface LandingPageProps {
  themeMod: ThemeMode
}

function LandingPage({ themeMod }: LandingPageProps) {
  const cardTheme = `card ${themeMod}-card`
  const renderProjectItems = projects?.map((project, index) => {
    return (
      <ProjectItem
        key={index}
        theme={cardTheme}
        title={project?.title}
        alt={project?.alt}
        path={project?.path}
        description={project?.description}
        website={project?.website}
        link={project?.link}
      />
    )
  })

  const dividerStyle = `antd-divider ${themeMod}-divider`

  return (
    <div className="landingPage">
      <img
        className="land-hero"
        src={hero}
        alt="corporate illustration of a front end computer process"
      />
      <div id="web-projects">
        <Divider plain className={dividerStyle}>
          WORK
        </Divider>
      </div>
      <p>Click on each item to learn more!</p>
      <br></br>
      <div className="project-container">{renderProjectItems}</div>
    </div>
  )
}

export default LandingPage
