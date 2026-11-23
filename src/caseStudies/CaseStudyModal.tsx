import { AppleOutlined, ArrowRightOutlined, ExperimentOutlined, GithubOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import { Component, Suspense, type ReactNode } from 'react'
import { AnnounceProvider } from '../a11y/announce'
import type { CaseStudy } from './types'
import '../Css/CaseStudy.css'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="cs-label mb-2 !text-accent">{title}</h3>
      {children}
    </section>
  )
}

/** A demo that throws shows a note instead of taking the whole page down with it. */
class DemoBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.error('Case study demo failed', error)
  }
  render() {
    return this.state.failed ? <p className="text-[var(--text-secondary)]">This demo couldn’t start in this browser.</p> : this.props.children
  }
}

function Body({ study }: { study: CaseStudy }) {
  const { Demo, links } = study
  const linkClass = 'btn-hacker btn-sm inline-flex items-center gap-2'
  return (
    <>
      <div
        className="relative aspect-[21/9] overflow-hidden bg-[var(--elevated)]"
        style={study.logoBackground ? { backgroundColor: study.logoBackground } : undefined}
      >
        <img src={study.image} alt={study.alt} className={`h-full w-full ${study.logoBackground ? 'object-contain p-6' : 'object-cover'}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] to-transparent" />
      </div>

      <div className="relative z-10 -mt-12 space-y-8 p-6 sm:p-8">
        <header>
          <p className="cs-label mb-2">Case study · {study.role}</p>
          <h2 className="mb-3 text-3xl font-bold text-[var(--text-primary)]">{study.title}</h2>
          <p className="text-lg leading-relaxed text-[var(--text-secondary)]">{study.summary}</p>
          {study.kind === 'job' && (
            <p className="cs-scope mt-3 text-sm text-[var(--text-muted)]">
              One of many projects from my role at {study.title}. This case study spotlights a single piece of
              that work.
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            {links.website && (
              <a href={links.website} target="_blank" rel="noreferrer" className={linkClass}>
                <ArrowRightOutlined aria-hidden /> Visit site
              </a>
            )}
            {links.appStore && (
              <a href={links.appStore} target="_blank" rel="noreferrer" className={linkClass}>
                <AppleOutlined aria-hidden /> App Store
              </a>
            )}
            {links.github && (
              <a href={links.github} target="_blank" rel="noreferrer" className={linkClass}>
                <GithubOutlined aria-hidden /> Code
              </a>
            )}
          </div>
        </header>

        <div className="grid gap-8 md:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            <Section title="Challenge">
              <p className="leading-relaxed text-[var(--text-secondary)]">{study.challenge}</p>
            </Section>
            <Section title="Outcome">
              <p className="leading-relaxed text-[var(--text-secondary)]">{study.outcome}</p>
            </Section>
          </div>
          <Section title="Approach">
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-[var(--text-secondary)] marker:text-accent">
              {study.approach.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </Section>
        </div>

        <Section title="Key decisions">
          <dl className="grid gap-3 sm:grid-cols-2">
            {study.decisions.map((d) => (
              <div key={d.call} className="cs-panel">
                <dt className="mb-1 font-semibold text-[var(--text-primary)]">{d.call}</dt>
                <dd className="text-sm leading-relaxed text-[var(--text-secondary)]">{d.why}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <ul className="flex flex-wrap gap-2" aria-label="Stack">
          {study.stack.map((s) => (
            <li key={s} className="rounded border border-[var(--border)] px-2 py-0.5 font-mono text-xs text-[var(--text-muted)]">
              {s}
            </li>
          ))}
        </ul>

        <section className="rounded-lg border border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.05)] p-5 sm:p-6">
          <p className="cs-label mb-1 flex items-center gap-1.5">
            <ExperimentOutlined aria-hidden /> Concept · live demo
          </p>
          <h3 className="mb-2 text-2xl font-semibold text-[var(--text-primary)]">{study.concept.name}</h3>
          <p className="mb-5 leading-relaxed text-[var(--text-secondary)]">{study.demoIntro}</p>
          {/* aria-modal hides the site-wide live region from screen readers, so demos announce inside the dialog. */}
          <AnnounceProvider>
            <DemoBoundary>
              <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-[var(--elevated)]" />}>
                <Demo />
              </Suspense>
            </DemoBoundary>
          </AnnounceProvider>
        </section>
      </div>
    </>
  )
}

interface Props {
  study: CaseStudy | null
  onClose: () => void
}

export default function CaseStudyModal({ study, onClose }: Props) {
  return (
    <Modal
      open={study !== null}
      title={null}
      onCancel={onClose}
      footer={null}
      width={880}
      destroyOnHidden
      className="project-modal"
      styles={{
        container: { backgroundColor: 'var(--surface)', padding: 0, borderRadius: '12px', overflow: 'hidden' },
        mask: { backgroundColor: 'var(--backdrop)', backdropFilter: 'blur(var(--backdrop-blur))' },
      }}
    >
      {study && <Body study={study} />}
    </Modal>
  )
}
