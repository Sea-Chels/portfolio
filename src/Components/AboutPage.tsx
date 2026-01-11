import '../Css/AboutPage.css'
import { Divider, Button } from 'antd'
import {
  CheckSquareOutlined,
  LinkedinOutlined,
  GithubOutlined,
  InstagramOutlined,
  MailOutlined,
  SnippetsOutlined,
} from '@ant-design/icons'
import aboutHero from '../Media/about-hero.png'
import lapTop from '../Media/coding.svg'
import resume from '../Media/CLSallady_Resume.pdf'

type ThemeMode = 'light' | 'dark'

interface AboutPageProps {
  theme: ThemeMode
}

const skills = [
  'Javascript/ES6+',
  'Typescript',
  'React.js',
  'React Native',
  'Python',
  'Node.js',
  'PostgreSQL',
  'SQL',
  'Apollo',
  'Graphql',
  'Sequelize',
  'Problem Solving',
  'UX/UI Design',
  'Adobe Creative Suite',
  'MongoDB',
  'OOP',
  'Express.js',
  'SAML/SSO Authentication',
  'Figma',
  'Database Management',
  'RESTful APIs',
  'AWS Cloud',
]

const renderSkills = skills?.map((s, index) => {
  return (
    <div key={index} className="skill-object">
      <CheckSquareOutlined />
      <p>{s}</p>
    </div>
  )
})

function AboutPage({ theme }: AboutPageProps) {
  const dividerStyle = `antd-divider ${theme}-divider`
  const text = `Hello, I'm a Full-Stack Software Engineer with an unconventional yet enriching journey. From my roots in design, I've cultivated a unique blend of communication, problem-solving, and creative thinking. As a lead graphic designer, I honed my skills in user-centric design, intertwining form with function to amplify brand narratives and resonate with audiences. Intrigued by the prospect of merging creativity with technology, I transitioned into software engineering, enrolling in a full-stack web development bootcamp to delve into the intricate world of coding. Today, I'm dedicated to crafting impactful and user-centric software solutions, driven by the belief that the fusion of design and technology can foster transformative experiences. My passion for pushing the boundaries of software engineering fuels my commitment to building innovative, results-driven solutions that drive business growth and enrich user experiences.`

  return (
    <div className="AboutPage">
      <h1 className="about-title">The Developer</h1>
      <div className="about-section">
        <img
          src={aboutHero}
          alt="Girl with short brown hair sitting on bed of plants while coding"
        />
        <Button className={`${theme}-button about-button`}>
          <a href={resume} target="_blank" rel="noreferrer">
            <SnippetsOutlined />
            View Resume
          </a>
        </Button>
        <Button className={`${theme}-button about-button`}>
          <a href="#skills">
            <SnippetsOutlined />
            View Skills
          </a>
        </Button>
        <Button className={`${theme}-button about-button`}>
          <a href="#contact">
            <SnippetsOutlined />
            Contact information
          </a>
        </Button>
        <br />
        <br />
        <br />
        <p className="about-content">{text}</p>
      </div>
      <div id="skills">
        <Divider plain className={`${dividerStyle} about-divider`}>
          SKILLS
        </Divider>
      </div>
      <img
        className="coding-img"
        src={lapTop}
        alt="Centered illustration of a computer with coding related imagery surrounding it."
      />
      <div className="skills-container">{renderSkills}</div>
      <div id="contact">
        <Divider plain className={`${dividerStyle} about-divider`}>
          CONTACT ME
        </Divider>
      </div>
      <p className="contact-blurb">Get in Touch!</p>
      <p className="contact-blurb">
        Ready to bring your project to life? Whether you're looking to build a web application from
        scratch, optimize an existing system, or anything in between, I'm here to help. With
        expertise in both front-end and back-end development, I offer tailored solutions to meet
        your unique needs.
      </p>
      <p className="contact-blurb">
        Feel free to reach out with details about your project, questions about my services, or just
        to say hello. I'm always excited to collaborate on new projects and explore opportunities to
        make ideas a reality.
      </p>
      <p className="contact-blurb">Contact me today to start the conversation.</p>
      <p>Let's turn your vision into code!</p>
      <br></br>
      <a
        className="social-icon"
        href="https://www.linkedin.com/in/chelby-sallady/"
        target="_blank"
        rel="noreferrer"
      >
        <LinkedinOutlined />
      </a>
      <a
        className="social-icon"
        href="https://github.com/Sea-Chels"
        target="_blank"
        rel="noreferrer"
      >
        <GithubOutlined />
      </a>
      <a
        className="social-icon"
        href="https://www.instagram.com/seachels_downunder"
        target="_blank"
        rel="noreferrer"
      >
        <InstagramOutlined />
      </a>
      <a className="social-icon" href="mailto:csallady.work@gmail.com">
        <MailOutlined />
      </a>
    </div>
  )
}

export default AboutPage
