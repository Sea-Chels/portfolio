import { lazy, useRef, useState } from 'react'
import {
  LinkedinOutlined,
  GithubOutlined,
  CodeOutlined,
  MessageOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import aboutHero from '../Media/about-hero.png'
import PhysicsText, { type PhysicsTextHandle } from './ui/PhysicsText'
import { useAnnounce } from '../a11y/announce'
import MountOnceOpened from './MountOnceOpened'
import { highlightSkills, skills } from '../content/skills'
import SectionMarker from './SectionMarker'
import { PAGE_SETTLE_MS, useReveal } from './useReveal'

const ContactFormModal = lazy(() => import('./ContactFormModal'))

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
  const isVisible = useReveal(PAGE_SETTLE_MS)
  const [showContactForm, setShowContactForm] = useState(false)
  const skillsToy = useRef<PhysicsTextHandle>(null)
  const announce = useAnnounce()

  const scatterSkills = () => {
    skillsToy.current?.scatter()
    announce('Skills scattered')
  }

  const bioText = `Hello, I'm a full-stack engineer who came to code through design. As a lead graphic designer, I learned to think about users, narrative and how a product should feel before deciding how to build it.

Today I'm a product engineer at NEWITY, where I own features end to end, from talking to users to shipping. I built the company's design system and its role-based access control, and I lead my own R&D, including AI research in Python.

Before that, I worked on healthcare and consumer products: a multi-agent AI health coach at ClosedLoop, a bilingual call center for pharmacy care teams at Zipdrug, and end-to-end encrypted messaging at Sanctuary. On my own time, I build things like a DIY app with hand-modeled, comic-styled 3D scenes.

The design background never left. I care as much about how a thing feels to use as whether the tests pass, and I like building systems (design systems, permission models, agent pipelines) that make the next feature easier to build.`

  return (
    <div className="page-width min-h-screen py-16">
      <section
        className={`mb-20 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <SectionMarker num="02" />

        <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-12">
          About Me
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="relative">
            <div data-comic-panel className="relative overflow-hidden rounded-2xl border border-[var(--border)]">
              <img
                src={aboutHero}
                alt="Illustration of developer with plants and laptop"
                className="w-full h-auto"
              />
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-accent rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-accent rounded-br-2xl" />
            </div>
          </div>

          <div>
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

      <section id="skills" className="mb-20 pt-8">
        <SectionMarker num="03" />

        <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
          Skills & Technologies
        </h2>
        <p className="text-lg text-[var(--text-muted)] mb-8 max-w-2xl">
          The tools behind the case studies, from AI agents and real-time APIs to 3D and design systems.
        </p>

        <div data-comic-panel className="relative h-[400px] border border-[var(--border)] rounded-xl bg-[var(--surface)] overflow-hidden">
          <PhysicsText
            ref={skillsToy}
            text={skills.join(' ')}
            highlightWords={highlightSkills}
            highlightClass="text-accent"
            mouseConstraintStiffness={0.3}
            fontSize="var(--skills-word-size)"
            fontFamily="var(--font-mono)"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p id="skills-hint" className="flex items-center gap-2 text-sm font-mono text-[var(--text-secondary)]">
            <svg aria-hidden className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            Drag the words to toss them around, or scatter them all at once.
          </p>
          <button
            type="button"
            onClick={scatterSkills}
            aria-describedby="skills-hint"
            className="btn-ghost btn-sm inline-flex items-center gap-2"
          >
            <ThunderboltOutlined aria-hidden />
            Scatter
          </button>
        </div>
      </section>

      <section id="contact" className="pt-8">
        <SectionMarker num="04" />

        <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
          Get In Touch
        </h2>
        <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl leading-relaxed">
          I'm always happy to hear from people building thoughtful products, especially in AI, healthcare or
          design systems. Whether it's a project, an idea you want a second opinion on, or just talking shop, the
          form below is the best way to reach me.
        </p>

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

        <button type="button" onClick={() => setShowContactForm(true)} className="btn-hacker inline-flex items-center gap-2">
          <MessageOutlined />
          Send me a message
        </button>
      </section>

      <MountOnceOpened open={showContactForm}>
        <ContactFormModal
          isOpen={showContactForm}
          onClose={() => setShowContactForm(false)}
        />
      </MountOnceOpened>

    </div>
  )
}

export default AboutPage
