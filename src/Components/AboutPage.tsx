import { useState, useEffect } from 'react'
import {
  LinkedinOutlined,
  GithubOutlined,
  CodeOutlined,
  MessageOutlined,
} from '@ant-design/icons'
import aboutHero from '../Media/about-hero.png'
import PhysicsText from './ui/PhysicsText'
import ContactFormModal from './ContactFormModal'
import { highlightSkills, skills } from '../content/skills'

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
  }
]

function AboutPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const bioText = `Hello, I'm a full-stack engineer who came to code through design. As a lead graphic designer, I learned to think about users, narrative and how a product should feel before deciding how to build it.

Today I'm a product engineer at NEWITY, where I own features end to end, from talking to users to shipping. I built the company's design system and its role-based access control, and I lead my own R&D, including AI research in Python.

Before that, I worked on healthcare and consumer products: a multi-agent AI health coach at ClosedLoop, a bilingual call center for pharmacy care teams at Zipdrug, and end-to-end encrypted messaging at Sanctuary. On my own time, I build things like a DIY app with hand-modeled, comic-styled 3D scenes.

The design background never left. I care as much about how a thing feels to use as whether the tests pass, and I like building systems (design systems, permission models, agent pipelines) that make the next feature easier to build.`

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
          <span className="section-num font-mono text-accent text-base">02</span>
          <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-12">
          About Me
        </h1>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Illustration */}
          <div className="relative">
            <div data-comic-panel className="relative overflow-hidden rounded-2xl border border-[var(--border)]">
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
              <a
                href="#skills"
                className="btn-ghost inline-flex items-center gap-2"
              >
                <CodeOutlined />
                Skills
              </a>
              <a
                href="#contact"
                className="btn-ghost inline-flex items-center gap-2"
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
          <span className="section-num font-mono text-accent text-base">03</span>
          <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
          Skills & Technologies
        </h2>
        <p className="text-lg text-[var(--text-muted)] mb-8 max-w-2xl">
          The tools behind the case studies, from AI agents and real-time APIs to 3D and design systems.
        </p>

        {/* Physics Text Skills */}
        <div data-comic-panel className="relative h-[400px] border border-[var(--border)] rounded-xl bg-[var(--surface)] overflow-hidden group">
          <PhysicsText
            text={skills.join(' ')}
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
          <span className="section-num font-mono text-accent text-base">04</span>
          <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
          Get In Touch
        </h2>
        <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl leading-relaxed">
          I'm always happy to hear from people building thoughtful products, especially in AI, healthcare or
          design systems. Whether it's a project, an idea you want a second opinion on, or just talking shop, the
          form below is the best way to reach me.
        </p>

        {/* Social Links */}
        <div className="flex flex-wrap gap-4 mb-8">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost inline-flex items-center gap-2"
            >
              <social.icon />
              {social.label}
            </a>
          ))}
        </div>

        {/* Contact Modal Trigger */}
        <button type="button" onClick={() => setShowContactForm(true)} className="btn-hacker inline-flex items-center gap-2">
          <MessageOutlined />
          Send me a message
        </button>
      </section>

      {/* Contact Modal */}
      <ContactFormModal
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
      />

    </div>
  )
}

export default AboutPage
