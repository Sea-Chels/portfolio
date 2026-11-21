import { lazy, useRef, useState } from 'react'
import Terminal from '../terminal/Terminal'
import { caseStudies } from '../caseStudies/data'
import CaseStudyCard from '../caseStudies/CaseStudyCard'
import type { CaseStudy } from '../caseStudies/types'
import MountOnceOpened from './MountOnceOpened'
import SectionMarker from './SectionMarker'
import { useReveal } from './useReveal'
import { useReducedMotion } from '../a11y/useReducedMotion'
import { CONTENT_DELAY_MS } from '../terminal/intro'

const CaseStudyModal = lazy(() => import('../caseStudies/CaseStudyModal'))
const ContactFormModal = lazy(() => import('./ContactFormModal'))

function LandingPage() {
  const showContent = useReveal(CONTENT_DELAY_MS, useReducedMotion())
  const [showContactModal, setShowContactModal] = useState(false)
  const [openStudy, setOpenStudy] = useState<CaseStudy | null>(null)
  const projectsRef = useRef<HTMLDivElement>(null)

  const scrollToProjects = () => {
    projectsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const openStudyById = (id: string) => setOpenStudy(caseStudies.find((s) => s.id === id) ?? null)

  return (
    <div className="min-h-screen">
      <section className="hero relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

        <Terminal
          studies={caseStudies.map(({ id, title }) => ({ id, title }))}
          onViewProjects={scrollToProjects}
          onOpenStudy={openStudyById}
        />

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

      <section
        ref={projectsRef}
        id="web-projects"
        className="py-24"
      >
        <div className="mb-16">
          <SectionMarker num="01" className="mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Selected Work
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Case studies from healthcare platforms to creative tools. Each one
            spotlights a single project, often one of many from that role, and
            pulls out a concept it taught me, with a live demo you can try.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caseStudies.map((study) => (
            <div key={study.id}>
              <CaseStudyCard study={study} onOpen={() => setOpenStudy(study)} />
            </div>
          ))}
        </div>
      </section>

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

      <MountOnceOpened open={openStudy !== null}>
        <CaseStudyModal study={openStudy} onClose={() => setOpenStudy(null)} />
      </MountOnceOpened>

      <MountOnceOpened open={showContactModal}>
        <ContactFormModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
        />
      </MountOnceOpened>
    </div>
  )
}

export default LandingPage
