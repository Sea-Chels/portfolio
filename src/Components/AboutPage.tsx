import { useState, useEffect } from 'react'
import {
  LinkedinOutlined,
  GithubOutlined,
  InstagramOutlined,
  MailOutlined,
  FileTextOutlined,
  CodeOutlined,
  MessageOutlined,
} from '@ant-design/icons'
import aboutHero from '../Media/about-hero.png'
import resume from '../Media/CLSallady_Resume.pdf'
import PhysicsText from './ui/PhysicsText'

const allSkills = [
  'JavaScript',
  'TypeScript',
  'Python',
  'React',
  'React-Native',
  'Node.js',
  'Express',
  'PostgreSQL',
  'MongoDB',
  'GraphQL',
  'Apollo',
  'REST-APIs',
  'AWS',
  'SSO/SAML',
  'Sequelize',
  'Prompt-Engineering',
  'Figma',
  'Adobe',
  'UX/UI',
  'AI-Workflows',
  'GitHub-Actions',
  'SQL',
  'TDD',
  'Vite',
  'AI/ML',
  'Jest',
  'Storybook',
  'Playwright',
]

const highlightSkills = ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS', 'AI-Workflows', 'Prompt-Engineering', 'TDD']

const socialLinks = [
  {
    icon: LinkedinOutlined,
    href: 'https://www.linkedin.com/in/chelby-sallady/',
    label: 'LinkedIn',
  },
  {
    icon: GithubOutlined,
    href: 'https://github.com/Sea-Chels',
    label: 'GitHub',
  },
  {
    icon: InstagramOutlined,
    href: 'https://www.instagram.com/seachels_downunder',
    label: 'Instagram',
  },
  {
    icon: MailOutlined,
    href: 'mailto:csallady.work@gmail.com',
    label: 'Email',
  },
]

function AboutPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [resumeCode, setResumeCode] = useState('')
  const [codeError, setCodeError] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleResumeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (resumeCode === '2672') {
      window.open(resume, '_blank')
      setShowResumeModal(false)
      setResumeCode('')
      setCodeError(false)
    } else {
      setCodeError(true)
    }
  }

  const bioText = `Hello, I'm a Full-Stack Software Engineer with an unconventional yet enriching journey. From my roots in design, I've cultivated a unique blend of communication, problem-solving, and creative thinking. As a lead graphic designer, I honed my skills in user-centric design, intertwining form with function to amplify brand narratives and resonate with audiences.

Intrigued by the prospect of merging creativity with technology, I transitioned into software engineering, enrolling in a full-stack web development bootcamp to delve into the intricate world of coding.

Today, I'm dedicated to crafting impactful and user-centric software solutions, driven by the belief that the fusion of design and technology can foster transformative experiences.`

  return (
    <div className="min-h-screen py-16">
      {/* Hero Section */}
      <section
        className={`mb-20 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Section Header */}
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono text-accent text-base">02</span>
          <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-12">
          About Me
        </h1>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Illustration */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border border-[var(--border)]">
              <img
                src={aboutHero}
                alt="Illustration of developer with plants and laptop"
                className="w-full h-auto"
              />
              {/* Decorative corner accent */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-accent rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-accent rounded-br-2xl" />
            </div>
          </div>

          {/* Bio Content */}
          <div>
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => setShowResumeModal(true)}
                className="btn-hacker inline-flex items-center gap-2"
              >
                <FileTextOutlined />
                Resume
              </button>
              <a
                href="#skills"
                className="px-5 py-3 border border-[var(--border)] text-[var(--text-secondary)] font-mono text-sm uppercase tracking-wider hover:border-accent hover:text-accent transition-all duration-300 inline-flex items-center gap-2"
              >
                <CodeOutlined />
                Skills
              </a>
              <a
                href="#contact"
                className="px-5 py-3 border border-[var(--border)] text-[var(--text-secondary)] font-mono text-sm uppercase tracking-wider hover:border-accent hover:text-accent transition-all duration-300 inline-flex items-center gap-2"
              >
                <MessageOutlined />
                Contact
              </a>
            </div>

            {/* Bio Text */}
            <div className="space-y-4">
              {bioText.split('\n\n').map((paragraph, i) => (
                <p
                  key={i}
                  className="text-lg text-[var(--text-secondary)] leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="mb-20 pt-8">
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono text-accent text-base">03</span>
          <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
          Skills & Technologies
        </h2>
        <p className="text-lg text-[var(--text-muted)] mb-8 max-w-2xl">
          A toolkit built through years of design and development experience.
        </p>

        {/* Physics Text Skills */}
        <div className="relative h-[400px] border border-[var(--border)] rounded-xl bg-[var(--surface)] overflow-hidden group">
          <PhysicsText
            text={allSkills.join(' ')}
            highlightWords={highlightSkills}
            highlightClass="text-accent"
            backgroundColor="transparent"
            gravity={0}
            mouseConstraintStiffness={0.3}
            fontSize="1.5rem"
            fontFamily="'JetBrains Mono', monospace"
          />
          {/* Interaction hint */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[var(--text-muted)] text-sm font-mono opacity-60 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span>drag to play</span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="pt-8">
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono text-accent text-base">04</span>
          <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
          Get In Touch
        </h2>
        <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl leading-relaxed">
          Ready to bring your project to life? Whether you're looking to build a
          web application from scratch, optimize an existing system, or anything
          in between, I'm here to help.
        </p>

        <p className="text-xl text-accent font-display mb-12">
          Let's turn your vision into code!
        </p>

        {/* Social Links */}
        <div className="flex flex-wrap gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 px-6 py-4 border border-[var(--border)] rounded-lg hover:border-accent hover:bg-accent/5 transition-all duration-300"
            >
              <social.icon className="text-2xl text-accent" />
              <span className="text-[var(--text-secondary)] group-hover:text-accent transition-colors">
                {social.label}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Resume Code Modal */}
      {showResumeModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => {
            setShowResumeModal(false)
            setResumeCode('')
            setCodeError(false)
          }}
        >
          <div
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <FileTextOutlined className="text-accent text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  Access Resume
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Enter the access code to view
                </p>
              </div>
            </div>

            <form onSubmit={handleResumeSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  value={resumeCode}
                  onChange={(e) => {
                    setResumeCode(e.target.value)
                    setCodeError(false)
                  }}
                  placeholder="Enter code"
                  autoFocus
                  className={`w-full px-4 py-3 bg-[var(--bg)] border rounded-lg font-mono text-center text-lg tracking-widest text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent transition-colors ${
                    codeError ? 'border-red-500' : 'border-[var(--border)]'
                  }`}
                />
                {codeError && (
                  <p className="text-red-500 text-sm mt-2 font-mono">
                    Invalid code. Try again.
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowResumeModal(false)
                    setResumeCode('')
                    setCodeError(false)
                  }}
                  className="flex-1 px-4 py-3 border border-[var(--border)] text-[var(--text-secondary)] font-mono text-sm uppercase tracking-wider hover:border-accent hover:text-accent transition-all duration-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-hacker"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AboutPage
