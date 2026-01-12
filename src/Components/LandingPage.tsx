import { useEffect, useRef, useState } from 'react'
import { projects } from '../Media'
import ProjectItem from './ProjectItem'
import ContactFormModal from './ContactFormModal'

type ThemeMode = 'light' | 'dark'

interface LandingPageProps {
  themeMod: ThemeMode
}

// Typing animation hook
function useTypingEffect(text: string, speed: number = 50, startDelay: number = 0) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setDisplayedText('')
    setIsComplete(false)

    const startTimeout = setTimeout(() => {
      let index = 0
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1))
          index++
        } else {
          setIsComplete(true)
          clearInterval(interval)
        }
      }, speed)

      return () => clearInterval(interval)
    }, startDelay)

    return () => clearTimeout(startTimeout)
  }, [text, speed, startDelay])

  return { displayedText, isComplete }
}

function LandingPage({ themeMod }: LandingPageProps) {
  const [showContent, setShowContent] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const projectsRef = useRef<HTMLDivElement>(null)

  const greeting = useTypingEffect('> hello world', 80, 300)
  const name = useTypingEffect('Chelby Sallady', 100, 1500)
  const title = useTypingEffect('Full Stack Developer', 60, 3200)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 4500)
    return () => clearTimeout(timer)
  }, [])

  const cardTheme = `card ${themeMod}-card`

  const scrollToProjects = () => {
    projectsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Terminal Style */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

        {/* Terminal Window */}
        <div className="relative z-10 w-full max-w-3xl mx-auto">
          {/* Terminal Chrome */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden shadow-2xl">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[var(--elevated)] border-b border-[var(--border)]">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-4 font-mono text-sm text-[var(--text-muted)]">
                ~/chelby-sallady
              </span>
            </div>

            {/* Terminal Content */}
            <div className="p-8 md:p-12 font-mono">
              {/* Greeting line */}
              <div className="text-accent text-lg md:text-xl mb-6">
                {greeting.displayedText}
                {!greeting.isComplete && (
                  <span className="animate-pulse">_</span>
                )}
              </div>

              {/* Name */}
              <h1 className="text-4xl md:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
                {name.displayedText}
                {greeting.isComplete && !name.isComplete && (
                  <span className="animate-pulse text-accent">_</span>
                )}
              </h1>

              {/* Title */}
              <div className="text-xl md:text-2xl text-[var(--text-secondary)] mb-8">
                {title.displayedText}
                {name.isComplete && !title.isComplete && (
                  <span className="animate-pulse text-accent">_</span>
                )}
              </div>

              {/* Description - appears after typing */}
              <p
                className={`text-[var(--text-muted)] text-base md:text-lg leading-relaxed mb-10 max-w-xl transition-all duration-700 ${
                  showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Crafting elegant digital experiences with clean code and creative
                vision. From pixel-perfect UIs to robust backend systems.
              </p>

              {/* Command prompt with CTA */}
              <div
                className={`transition-all duration-700 delay-200 ${
                  showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="flex items-center gap-3 text-[var(--text-muted)] mb-6">
                  <span className="text-accent">$</span>
                  <span>view --projects</span>
                </div>

                <button
                  onClick={scrollToProjects}
                  className="btn-hacker"
                >
                  Execute
                </button>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-accent/30 rounded-br-lg" />
          <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-accent/30 rounded-tl-lg" />
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 ${
            showContent ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
            <span className="font-mono text-xs">scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-accent to-transparent animate-pulse" />
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section
        ref={projectsRef}
        id="web-projects"
        className="py-24"
      >
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono text-accent text-base">01</span>
            <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Selected Work
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            A collection of projects showcasing my expertise in full-stack
            development, from healthcare platforms to creative applications.
          </p>
        </div>

        {/* Project Grid */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project, index) => (
              <div
                key={index}
                className="animate-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProjectItem
                  theme={cardTheme}
                  title={project?.title}
                  alt={project?.alt}
                  path={project?.path}
                  description={project?.description}
                  website={project?.website}
                  link={project?.link}
                  appStore={project?.appStore}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-6">
            Interested in working together?
          </h3>
          <p className="text-lg text-[var(--text-secondary)] mb-10">
            Let's turn your vision into reality.
          </p>
          <button
            onClick={() => setShowContactModal(true)}
            className="btn-hacker inline-block text-base"
          >
            Get In Touch
          </button>
        </div>
      </section>

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  )
}

export default LandingPage
