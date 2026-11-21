import { ArrowRightOutlined, ExperimentOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import type { CaseStudy } from './types'
import '../Css/CaseStudy.css'

/** Freezes a GIF on its first frame until hover, so a grid of them isn't all animating at once. */
function useFirstFrame(src: string): string | null {
  const [frame, setFrame] = useState<string | null>(null)
  useEffect(() => {
    if (!src.toLowerCase().endsWith('.gif')) return
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (cancelled) return
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      setFrame(canvas.toDataURL('image/png'))
    }
    img.src = src
    return () => {
      cancelled = true
      img.onload = null
    }
  }, [src])
  return frame
}

interface Props {
  study: CaseStudy
  onOpen: () => void
}

export default function CaseStudyCard({ study, onOpen }: Props) {
  const [hovering, setHovering] = useState(false)
  const isGif = study.image.toLowerCase().endsWith('.gif')
  const frame = useFirstFrame(study.image)
  const shown = isGif && !hovering ? (frame ?? study.image) : study.image

  return (
    <article
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="cs-card group relative flex h-full flex-col overflow-hidden card-hacker"
    >
      <div
        className="cs-card-art relative aspect-video overflow-hidden bg-[var(--elevated)]"
        style={study.logoBackground ? { backgroundColor: study.logoBackground } : undefined}
      >
        <img
          src={shown}
          alt={study.alt}
          className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${study.logoBackground ? 'object-contain p-6' : 'object-cover'}`}
        />
        {isGif && !hovering && frame && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-[rgb(var(--scrim-rgb)/0.6)] p-4 backdrop-blur-sm">
              <PlayCircleOutlined className="text-4xl text-[rgb(var(--overlay-fg-rgb))]" aria-hidden />
            </div>
          </div>
        )}
        <div className="absolute left-0 right-0 top-0 h-1 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="cs-label mb-2">{study.role}</p>
        <h3 className="mb-3 text-xl font-semibold text-[var(--text-primary)] transition-colors duration-200 group-hover:text-accent">
          <button type="button" onClick={onOpen} className="cs-card-open text-left">
            {study.title}
          </button>
        </h3>
        <p className="mb-5 line-clamp-2 text-base leading-relaxed text-[var(--text-secondary)]">{study.summary}</p>

        <div className="cs-panel mt-auto">
          <p className="cs-label mb-1 flex items-center gap-1.5">
            <ExperimentOutlined aria-hidden /> Concept
          </p>
          <p className="font-semibold text-accent">{study.concept.name}</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">{study.concept.teaser}</p>
        </div>

        <p className="mt-5 flex items-center gap-2 font-mono text-sm text-accent" aria-hidden>
          Read case study + live demo
          <ArrowRightOutlined className="transition-transform duration-200 group-hover:translate-x-1" />
        </p>
      </div>
    </article>
  )
}
