import { useEffect, useRef, useState } from 'react'
import { projects } from '../Media'
import ProjectItem from './ProjectItem'
import { Particles } from './ui'

type ThemeMode = 'light' | 'dark'

interface LandingPageProps {
  themeMod: ThemeMode
}

function LandingPage({ themeMod }: LandingPageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const projectsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Trigger animations after mount
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const cardTheme = `card ${themeMod}-card`

  const scrollToProjects = () => {
    projectsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Particle colors based on theme
  const particleColors =
    themeMod === 'dark'
      ? ['#FF7A64', '#ff8f7d', '#fb923c', '#2a2a2a']
      : ['#FF7A64', '#ff8f7d', '#e0e0e0', '#d4d4d4']

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <Particles
          particleCount={150}
          particleSpread={15}
          speed={0.05}
          particleColors={particleColors}
          moveParticlesOnHover={true}
          particleHoverFactor={1}
          alphaParticles={true}
          particleBaseSize={80}
          sizeRandomness={1.5}
          cameraDistance={25}
          className="opacity-60"
        />

        {/* Grid overlay for hacker aesthetic */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 text-center px-8 max-w-4xl mx-auto">
          {/* Terminal-style greeting */}
          <div
            className={`font-mono text-base text-[var(--text-muted)] mb-8 leading-normal transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="text-accent">{'>'}</span> hello world
          </div>

          {/* Name */}
          <h1
            className={`font-display text-6xl md:text-8xl text-accent mb-10 leading-tight transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Chelby Sallady
          </h1>

          {/* Tagline */}
          <p
            className={`text-xl md:text-2xl text-[var(--text-secondary)] mb-10 leading-relaxed transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Full Stack Developer & Creative Technologist
          </p>

          {/* Description */}
          <p
            className={`text-base md:text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-16 leading-loose transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Crafting elegant digital experiences with clean code and creative
            vision. From pixel-perfect UIs to robust backend systems.
          </p>

          {/* CTA Button */}
          <button
            onClick={scrollToProjects}
            className={`btn-hacker transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            View My Work
          </button>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
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
        <div className="max-w-7xl mx-auto mb-20">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono text-accent text-base">01</span>
            <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-6">
            Selected Work
          </h2>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed">
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
          <a
            href="mailto:your-email@example.com"
            className="btn-hacker inline-block text-base"
          >
            Get In Touch
          </a>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
