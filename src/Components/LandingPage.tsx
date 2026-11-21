import { useEffect, useRef, useState } from 'react'
import Terminal from '../terminal/Terminal'
import { caseStudies } from '../caseStudies/data'
import CaseStudyCard from '../caseStudies/CaseStudyCard'
import CaseStudyModal from '../caseStudies/CaseStudyModal'
import type { CaseStudy } from '../caseStudies/types'
import ContactFormModal from './ContactFormModal'

function LandingPage() {
  const [showContent, setShowContent] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [openStudy, setOpenStudy] = useState<CaseStudy | null>(null)
  const projectsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 4500)
    return () => clearTimeout(timer)
  }, [])

  const scrollToProjects = () => {
    projectsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const openStudyById = (id: string) => setOpenStudy(caseStudies.find((s) => s.id === id) ?? null)

  return (
    <div className="min-h-screen">
      {/* Hero Section - Terminal Style */}
      <section className="hero relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

        <Terminal
          studies={caseStudies.map(({ id, title }) => ({ id, title }))}
          onViewProjects={scrollToProjects}
          onOpenStudy={openStudyById}
        />

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
            <span className="section-num font-mono text-accent text-base">01</span>
            <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Selected Work
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Case studies from healthcare platforms to creative tools. Each one
            spotlights a single project, often one of many from that role, and
            pulls out a concept it taught me, with a live demo you can try.
          </p>
        </div>

        {/* Project Grid */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caseStudies.map((study, index) => (
              <div
                key={study.id}
                className="animate-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CaseStudyCard study={study} onOpen={() => setOpenStudy(study)} />
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

      <CaseStudyModal study={openStudy} onClose={() => setOpenStudy(null)} />

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  )
}

export default LandingPage
