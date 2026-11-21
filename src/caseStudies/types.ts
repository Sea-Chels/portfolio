import type { ComponentType, LazyExoticComponent } from 'react'

export interface CaseStudyLinks {
  website?: string
  github?: string
  appStore?: string
}

export interface CaseStudy {
  id: string
  title: string
  role: string
  /** Jobs get a note that the case study spotlights one piece of a much larger role. */
  kind: 'job' | 'personal' | 'client'
  image: string
  alt: string
  /** Logos sit inside the frame on a brand color instead of being cropped to fill it. */
  logoBackground?: string
  summary: string
  concept: {
    name: string
    teaser: string
  }
  challenge: string
  approach: string[]
  /** The calls that shaped the system and why: the trade-offs, not the tasks. */
  decisions: { call: string; why: string }[]
  outcome: string
  stack: string[]
  links: CaseStudyLinks
  demoIntro: string
  Demo: LazyExoticComponent<ComponentType>
}
